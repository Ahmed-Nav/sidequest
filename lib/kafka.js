import { Kafka, logLevel } from 'kafkajs';


const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const kafka = new Kafka({
  clientId: 'ecommerce-nextjs-app',
  brokers: brokers,
  logLevel: logLevel.INFO, 
});

let producerInstance = null;
let producerConnecting = false;

export const getProducer = async () => {
  if (producerInstance) {
    return producerInstance;
  }
  if (producerConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100)); 
    return getProducer(); 
  }

  producerConnecting = true;
  const producer = kafka.producer({
     allowAutoTopicCreation: false, 
     transactionTimeout: 60000,
  });

  try {
    console.log('Connecting Kafka Producer...');
    await producer.connect();
    console.log('Kafka Producer Connected.');
    producerInstance = producer;

    producer.on('producer.disconnect', (event) => {
        console.error('Kafka Producer disconnected!', event);
        producerInstance = null; 
        producerConnecting = false;
        
    });

  } catch (error) {
    console.error('Failed to connect Kafka producer:', error);
    producerConnecting = false;
    throw error; 
  } finally {
      producerConnecting = false;
  }

  return producerInstance;
};


export const disconnectProducer = async () => {
  if (producerInstance) {
    try {
      console.log('Disconnecting Kafka Producer...');
      await producerInstance.disconnect();
      console.log('Kafka Producer Disconnected.');
      producerInstance = null;
      producerConnecting = false;
    } catch (error) {
      console.error('Failed to disconnect Kafka producer:', error);
    }
  }
};

export default kafka; 