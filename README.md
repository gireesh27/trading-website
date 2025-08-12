# TradeView

Welcome to **TradeView**, a professional trading platform with real-time market data, advanced charting, and comprehensive portfolio management.

[https://trading-website-two.vercel.app/](url)

-----

## ✨ Features

  * **Secure Authentication**: Log in seamlessly using your **Google** or **GitHub** accounts, or with the traditional **email and password** method, all powered by **Next-Auth**.
  * **Advanced Trading Interface**:
      * Dynamic and real-time **candlestick** and **line charts** from **Finnhub**, **Polygon.io**, and **Yahoo Finance**.
      * A comprehensive set of **drawing tools** for in-depth technical analysis.
      * Essential **technical indicators** such as Simple Moving Averages (SMA), Exponential Moving Averages (EMA), Relative Strength Index (RSI), and Moving Average Convergence Divergence (MACD).
      * Engaging and smooth animations powered by **Framer Motion** and **Three.js**.
  * **Extensive Market Coverage**:
      * Live tracking of global **stock markets** and a wide range of **cryptocurrencies** from **CoinGecko**.
      * A dedicated and up-to-the-minute news feed for both cryptocurrencies and public companies to keep you informed of market-moving events.
  * **Wallet & Transactions**:
      * Effortlessly add funds to your wallet using secure payment gateways like **Razorpay** and **PayU**.
      * Withdraw your funds securely to your bank account with **Cashfree**.
      * A detailed and complete **transaction history** to monitor all your financial activities.
  * **Portfolio & Holdings**:
      * A comprehensive and user-friendly dashboard to view your investment **holdings** and track your portfolio's performance over time.
      * Instantly see your profits, losses, and asset allocation.
  * **Watchlists & Alerts**:
      * Create and manage personalized **watchlists** to keep a close eye on your favorite stocks and cryptocurrencies.
      * Set up custom **price alerts** to receive notifications about significant market movements.
  * **Order Management**:
      * Place various types of orders, including **market**, **limit**, and **stop-loss** orders.
      * Access your complete **order history**, with details on filled, pending, and canceled orders.
  * **Community Insights**:
      * An integrated community page that pulls posts from **r/algotrading** via the **Reddit API**, keeping you connected with the trading community.

-----

## 🛠️ Tech Stack

  * **Frontend**: **Next.js**, **Tailwind CSS**, **TypeScript**
  * **UI Components**: **Shadcn**
  * **Animations**: **Framer Motion**, **Three.js**
  * **Backend**: **Next.js API Routes**
  * **Database**: **MongoDB**
  * **Caching**: **Redis**
  * **Authentication**: **Next-Auth**

-----

## 🏗️ System Architecture and Workflow

TradeView is built on a modern, scalable architecture designed for high performance and real-time data delivery.

### Overall Architecture

  * **Frontend**: A responsive and interactive UI built with **Next.js** and styled with **Tailwind CSS** and **Shadcn** components. The animations are powered by **Framer Motion** and **Three.js**.
  * **Backend**: Server-side logic is efficiently handled by **Next.js API Routes**.
  * **Database**: **MongoDB** serves as the primary database, storing user data, transactions, holdings, and watchlists.
  * **Caching**: **Redis** is implemented as a high-speed in-memory cache to store frequently accessed data like stock and crypto prices, significantly reducing database load and improving response times.
  * **Authentication**: **Next-Auth** provides a robust and secure authentication system, supporting both OAuth (Google, GitHub) and credentials-based login.
  * **Real-time Data**: A combination of **Finnhub**, **Polygon.io**, **CoinGecko**, and **Yahoo Finance** APIs provide live and historical market data.
  * **Payment Processing**: **Razorpay** and **PayU** are used for deposits, and **Cashfree** is used for withdrawals.
  * **Automation**: A **cron job** runs daily to automate the process of fetching and updating stock and cryptocurrency prices.

### Website Workflow

1.  **User Authentication**: The user signs up or logs in via Google, GitHub, or email. Their session is securely managed by **Next-Auth**, and a user profile is created in **MongoDB**.
2.  **Data Fetching & Caching**:
      * When a user requests data for a stock or cryptocurrency for the first time, the system fetches it from the respective API (**Polygon.io**, **Finnhub**, **CoinGecko**, or **Yahoo Finance**).
      * This data is then stored in the **MongoDB** database for historical reference.
      * The most recent and frequently accessed price data is also pushed to the **Redis cache**.
      * Subsequent requests for the same data are served directly from **Redis**, ensuring near-instant load times.
3.  **Automated Daily Price Updates**:
      * A **cron job** is scheduled to run at the end of each trading day.
      * This job systematically fetches the closing prices and other relevant data for all tracked stocks and cryptocurrencies.
      * It updates the **MongoDB** database with this new information and refreshes the **Redis cache** to ensure the data is current for the next trading session.
4.  **Real-time Trading Interface**:
      * When a user views a trading chart, historical data is loaded from the **Redis cache** or **MongoDB**.
      * A WebSocket connection is established with **Finnhub** to stream live price updates, which are reflected on the chart in real-time.
5.  **Placing an Order**:
      * The user places a buy or sell order.
      * The system verifies the user's wallet balance and holdings.
      * The order is recorded in the **MongoDB** database.
      * Once the order is executed, the user's **holdings** and **wallet** are updated accordingly.
6.  **News, Watchlists, and Alerts**:
      * The **Finnhub API** is used to fetch live news, which is displayed on the dashboard.
      * Users can add stocks and cryptocurrencies to their **watchlist**, which is stored in **MongoDB**. The watchlist data is then fetched and displayed in real-time.
      * The system continuously monitors the prices of assets in the user's alerts list and sends a notification when a target price is met.

### Performance and Analytics

  * **Performance**: The combination of **Next.js** for server-side rendering, **Redis** for caching, and efficient database queries ensures a fast and responsive user experience.
  * **Analytics**: The platform is designed to support future integration with analytics tools. By analyzing order and transaction data in **MongoDB**, you can generate insights into user trading patterns, popular assets, and overall platform activity.

-----

## 🛠️ APIs Used

  * **[Finnhub](https://finnhub.io/)**: Real-time stock/crypto data and market news.
  * **[Polygon.io](https://polygon.io/)**: Historical stock and crypto data.
  * **[CoinGecko](https://www.coingecko.com/en/api)**: Comprehensive cryptocurrency data.
  * **[RapidAPI - Yahoo Finance](https://rapidapi.com/sparior/api/yahoo-finance15)**: An alternative source for financial data.
  * **[Razorpay](https://razorpay.com/)**: Payment gateway for deposits.
  * **[PayU](https://payu.in/)**: Alternative payment gateway.
  * **[Cashfree](https://www.cashfree.com/)**: Payouts to bank accounts.
  * **[Reddit API](https://www.reddit.com/dev/api/)**: Fetching posts from r/algotrading.

-----

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * Node.js (v18 or higher)
  * npm or yarn
  * Redis server installed and running
  * MongoDB instance

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/gireesh27/trading-website.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env.local` file in the root directory and add the environment variables from the `env.example` file.
4.  Run the development server
    ```sh
    npm run dev
    ```
5.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

-----

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Author and Copyrights:

Gireesh Kasa
