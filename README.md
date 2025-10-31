# ꜱɪᴅᴇ ǫᴜᴇꜱᴛ - Tech E-Commerce Platform

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-cyan?style=for-the-badge&logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-white?style=for-the-badge&logo=mongodb)
![Kafka](https://img.shields.io/badge/Apache_Kafka-black?style=for-the-badge&logo=apachekafka)
![Inngest](https://img.shields.io/badge/Inngest-blueviolet?style=for-the-badge&logo=inngest)
![Clerk](https://img.shields.io/badge/Clerk-black?style=for-the-badge&logo=clerk)

**Side Quest** is a full-stack, event-driven e-commerce platform built with a modern, decoupled architecture. It features a complete customer shopping experience, a dedicated seller dashboard for managing products and orders, and a robust backend powered by Next.js, MongoDB, Kafka, and Inngest.

This project serves as an expert example of building a scalable, real-world application using a modern tech stack, with a strong emphasis on asynchronous job handling and authentication.

---

## Key Features

### 1. Customer-Facing Application
* **Modern UI/UX:** A clean, responsive, and intuitive shopping interface built with Next.js App Router and Tailwind CSS.
* **Authentication:** Secure user sign-up, sign-in, and profile management powered by Clerk.
* **Product Discovery:** Home page with featured sliders, product carousels, and a dedicated "All Products" page with grid views.
* **Detailed Product Pages:** Dynamic routing for individual product details, including image galleries and "Add to Cart" functionality.
* **Shopping Cart:** A fully persistent shopping cart with quantity updates and a clear order summary.
* **Full Checkout Flow:** Multi-step checkout process including shipping address management (add/select) and order placement.
* **Order History:** A dedicated "My Orders" page for users to view their past orders and fulfillment status.

### 2. Seller Dashboard
* **Role-Based Access:** A separate, protected area (`/seller`) for users with a 'seller' role, authenticated via Clerk custom metadata.
* **Product Management:** A form for sellers to add new products, including details, pricing, categories, and multi-image uploads to Cloudinary.
* **Product List:** A dashboard view for sellers to see all products they have listed.
* **Order Fulfillment:** A comprehensive list of all customer orders, allowing sellers to view order details, items, and customer shipping information.

### 3. Backend & System Architecture
* **Event-Driven Ordering:** Order creation is decoupled using **Apache Kafka**. When a user places an order, the API sends a message to a Kafka topic for asynchronous processing, ensuring high availability and resilience.
* **Asynchronous Job Handling:** **Inngest** is used to handle background jobs and webhooks. This includes:
    * **Clerk User Sync:** Automatically creating, updating, or deleting users in the MongoDB database when corresponding events are received from Clerk webhooks.
    * **Order Processing:** A dedicated Inngest function (`createUserOrder`) is set up to process order events.
* **MongoDB Database:** Leverages Mongoose for elegant schema definitions for Users, Products, Orders, and Addresses.
* **Cloud Image Management:** Integrates with **Cloudinary** for robust, cloud-based image hosting and delivery for product images.
* **Next.js API Routes:** All backend logic is served via Next.js API Routes, providing a full-stack, monolithic development experience.
* **Global State Management:** Uses React Context (`AppContext.jsx`) for managing global state like cart, user data, and products across the application.

## Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [**Next.js (App Router)**](https://nextjs.org/) | Full-stack framework, React, routing, SSR |
| | [**React**](https://react.dev/) | UI library |
| | [**Tailwind CSS**](https://tailwindcss.com/) | Utility-first CSS framework |
| **Backend** | [**Next.js API Routes**](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | Server-side logic and API endpoints |
| | [**MongoDB**](https://www.mongodb.com/) | NoSQL database for all application data |
| | [**Mongoose**](https://mongoosejs.com/) | Object Data Modeling (ODM) for MongoDB |
| **Services** | [**Clerk**](https://clerk.com/) | Authentication and user management |
| | [**Cloudinary**](https://cloudinary.com/) | Cloud-based image upload and hosting |
| **Architecture** | [**Apache Kafka**](https://kafka.apache.org/) | Event streaming platform for order processing |
| | [**Inngest**](https://www.inngest.com/) | Event handling & background job processing |
| | [**Docker**](https://www.docker.com/) | Containerization for Kafka/Zookeeper dev environment |

## Project Structure

```
sidequest/
├── app/
│   ├── (customer)/             # Inferred grouping for customer pages
│   │   ├── add-address/
│   │   ├── all-products/
│   │   ├── cart/
│   │   ├── my-orders/
│   │   ├── order-placed/
│   │   ├── product/[id]/
│   │   └── page.jsx            # Home page
│   ├── api/                    # Backend API Routes
│   │   ├── cart/
│   │   ├── inngest/            # Inngest webhook handler
│   │   ├── order/
│   │   ├── product/
│   │   └── user/
│   ├── seller/                 # Seller Dashboard
│   │   ├── orders/
│   │   ├── product-list/
│   │   └── page.jsx            # Add Product page
│   ├── globals.css
│   └── layout.js               # Root layout
├── components/
│   ├── seller/                 # Seller-specific components
│   ├── Banner.jsx
│   ├── Navbar.jsx
│   ├── OrderSummary.jsx
│   └── ProductCard.jsx
├── config/
│   ├── db.js                   # MongoDB connection logic
│   └── inngest.js              # Inngest function definitions
├── context/
│   └── AppContext.jsx          # Global React state context
├── lib/
│   ├── authSeller.js           # Seller role authentication helper
│   └── kafka.js                # Kafka producer client setup
├── models/                     # Mongoose Schemas
│   ├── Address.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
├── middleware.ts               # Clerk authentication middleware
├── docker-compose.yaml         # For running Kafka/Zookeeper
├── .env.example                # Environment variable template
└── package.json
```

## Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB (a local instance or a cloud URI, e.g., from MongoDB Atlas)
* A [Clerk](https://clerk.com/) account (for API keys)
* A [Cloudinary](https://cloudinary.com/) account (for API keys)
* [Docker](https://www.docker.com/products/docker-desktop/) (to run Kafka locally)

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/sidequest.git](https://github.com/your-username/sidequest.git)
cd sidequest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials.

```bash
cp .env.example .env.local
```
Now, open `.env.local` and add your secret keys from MongoDB, Clerk, Cloudinary, etc.

### 4. Run Local Services (Kafka)

This project uses Docker Compose to easily run Kafka and Zookeeper for event streaming.

```bash
docker-compose up -d
```
This will start the required services in the background.

### 5. Run the Development Server

```bash
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

The backend is exposed via Next.js API Routes:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/product/add` | **(Seller)** Adds a new product. |
| `GET` | `/api/product/list` | **(Customer)** Gets all products for the shop. |
| `GET` | `/api/product/seller-list` | **(Seller)** Gets products for the seller dashboard. |
| `POST` | `/api/order/create` | **(Customer)** Creates a new order and sends to Kafka. |
| `GET` | `/api/order/list` | **(Customer)** Gets the logged-in user's order history. |
| `GET` | `/api/order/seller-orders` | **(Seller)** Gets all orders for the seller dashboard. |
| `GET` | `/api/user/data` | Gets the logged-in user's data from MongoDB. |
| `POST` | `/api/user/add-address` | **(Customer)** Adds a new shipping address. |
| `GET` | `/api/user/get-address` | **(Customer)** Gets all addresses for the logged-in user. |
| `GET` | `/api/cart/get` | **(Customer)** Gets the user's persistent cart. |
| `POST` | `/api/cart/update` | **(Customer)** Updates/saves the user's cart. |
| `POST` | `/api/inngest` | **(Webhook)** Inngest webhook handler for Clerk events. |

## Contributing

We welcome all kinds of contributions! You can:

* Create new pages
* Improve layouts
* Add animations and transitions
* Enhance responsiveness
* Refactor components
* Suggest new UI/UX ideas
* Add themes or color variations
* Introduce accessibility improvements
* Add filtering/search features
* Improve documentation

## License

This project is licensed under the **MIT License**.