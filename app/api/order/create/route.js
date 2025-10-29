// app/api/order/create/route.js
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product"; 
import User from "@/models/User"; 
import connectDB from "@/config/db"; 
import { getProducer } from "@/lib/kafka"; 
import { inngest } from "@/config/inngest";

export async function POST(request) {
  let producer; 

  try {
    
    await connectDB();

    const { userId } = getAuth(request);
    const { address, items } = await request.json(); 

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!address || !items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid order data received:", { userId, address, items });
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    
    let calculatedAmount = 0;
    try {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.warn(
            `Product ID ${item.product} not found during order creation for user ${userId}. Skipping item.`
          );
          continue; 
        }
        
        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          console.warn(
            `Invalid quantity ${item.quantity} for product ID ${item.product}. Skipping item.`
          );
          continue; 
        }
        calculatedAmount += product.offerPrice * quantity;
      }
    } catch (calcError) {
      console.error(
        `Error calculating order amount for user ${userId}:`,
        calcError
      );
      return NextResponse.json(
        { success: false, message: "Failed to calculate order amount." },
        { status: 500 }
      );
    }

    if (calculatedAmount <= 0 && items.length > 0) {
      console.warn(
        `Calculated amount is zero or negative for user ${userId} despite items present. Items:`,
        items
      );
      
      return NextResponse.json(
        { success: false, message: "Could not determine valid order total." },
        { status: 400 }
      );
    }

    const totalAmount = calculatedAmount + Math.floor(calculatedAmount * 0.02); 
    const orderEventPayload = {
      eventId: crypto.randomUUID(), 
      eventType: "OrderCreated",
      timestamp: Date.now(),
      payload: {
        userId,
        address,
        items: items.map((item) => ({
          productId: item.product,
          quantity: item.quantity,
        })), 
        amount: totalAmount,
        currency: process.env.NEXT_PUBLIC_CURRENCY || "USD", 
        orderDate: Date.now(), 
        initialStatus: "PENDING",
      },
    };

  
    try {
      producer = await getProducer(); 
      await producer.send({
        topic: "orders",
        messages: [
          
          { key: userId, value: JSON.stringify(orderEventPayload) },
        ],
      });
      console.log(
        `Order event sent to Kafka for user ${userId}, Event ID: ${orderEventPayload.eventId}`
      );
    } catch (kafkaError) {
      console.error(
        `Failed to send order event to Kafka for user ${userId}:`,
        kafkaError
      );
      
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to submit order for processing. Please try again later.",
        },
        { status: 500 }
      );
    }

    
    try {
      const user = await User.findById(userId);
      if (user) {
        user.cartItems = {};
        await user.save();
        console.log(`Cart cleared for user ${userId}`);
      } else {
        console.warn(`User ${userId} not found when trying to clear cart.`);
      }
    } catch (cartError) {
      console.error(`Failed to clear cart for user ${userId}:`, cartError);
      
    }

    
    return NextResponse.json({
      success: true,
      message:
        "Order submitted successfully! You will receive confirmation shortly.",
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/order/create:", error);
    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
  
}
