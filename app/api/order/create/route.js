import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product"; 
import User from "@/models/User";       
import Order from "@/models/Order";     
import connectDB from "@/config/db";  
import { getProducer } from "@/lib/kafka"; 

export async function POST(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request);
    const { address, items } = await request.json(); 

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }
    if (!address || !items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid order data received:', { userId, address, items });
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }


    let calculatedAmount = 0;
    try {
      for (const item of items) {
        const product = await Product.findById(item.product); 
        if (!product) {
          console.warn(`Product ID ${item.product} not found. Skipping item.`);
          continue;
        }
        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          console.warn(`Invalid quantity ${item.quantity} for product ID ${item.product}. Skipping item.`);
          continue;
        }
        calculatedAmount += product.offerPrice * quantity;
      }
    } catch (calcError) {
      console.error(`Error calculating order amount for user ${userId}:`, calcError);
      return NextResponse.json({ success: false, message: 'Failed to calculate order amount.' }, { status: 500 });
    }

    if (calculatedAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Could not determine valid order total.' }, { status: 400 });
    }

    const totalAmount = calculatedAmount + Math.floor(calculatedAmount * 0.02); 


    let newOrder;
    try {
      newOrder = new Order({
        userId,
        items: items, 
        amount: totalAmount,
        address: address, 
        status: 'Pending', 
        date: new Date(Date.now()),
        eventId: crypto.randomUUID() 
      });
      await newOrder.save();
      console.log(`Saved pending Order ${newOrder._id} for user ${userId}`);

    } catch (dbError) {
      console.error("Failed to save pending order:", dbError);
      return NextResponse.json({ success: false, message: 'Failed to create order record.' }, { status: 500 });
    }

 
    const orderEventPayload = {
      eventId: crypto.randomUUID(), 
      eventType: 'OrderProcessingRequested',
      timestamp: Date.now(),
      payload: {
        orderId: newOrder._id.toString(), 
        userId: newOrder.userId,
        items: newOrder.items.map(item => ({
            productId: item.product.toString(), 
            quantity: item.quantity
        })),
        amount: newOrder.amount,
        addressId: newOrder.address.toString() 
      }
    };


    try {
      const producer = await getProducer();
      await producer.send({
        topic: process.env.KAFKA_ORDER_TOPIC || 'orders',
        messages: [
          { key: userId, value: JSON.stringify(orderEventPayload) },
        ],
      });
      console.log(`Order processing event sent for Order ${newOrder._id}`);
    } catch (kafkaError) {

      console.error(`Failed to send order to Kafka:`, kafkaError);
      try {
        newOrder.status = 'Failed (Kafka Send Error)';
        await newOrder.save();
      } catch (saveError) {
        console.error("Failed to save error status for order:", saveError);
      }
      return NextResponse.json({ success: false, message: 'Failed to submit order for processing.' }, { status: 500 });
    }


    try {
      const user = await User.findById(userId);
      if (user) {
        user.cartItems = {};
        await user.save();
      }
    } catch (cartError) {
      console.error(`Failed to clear cart for user ${userId}:`, cartError);

    }


    return NextResponse.json({ success: true, message: 'Order submitted successfully!' });

  } catch (error) {
    console.error('Unexpected error in POST /api/order/create:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}