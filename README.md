# TradeView

Welcome to **TradeView**, a professional trading platform with real-time market data, advanced charting, and comprehensive portfolio management.

[trading-website-two.vercel.app](https://www.google.com/search?q=http://trading-website-two.vercel.app)

## ✨ Features

  * **Authentication**: Secure user authentication using **Google**, **GitHub**, and traditional **email/password** credentials.
  * **Graphical Trading Interface**:
      * Advanced charting with real-time data.
      * Candlestick and line chart options.
      * Drawing tools for technical analysis.
      * Technical indicators like SMA, EMA, RSI, and MACD.
      * Beautiful animations and a smooth user experience.
  * **Live Tracking**:
      * Real-time tracking of **crypto** and **stock markets**.
      * Live news feed for cryptocurrencies and companies.
  * **Wallet Features**:
      * Add money to your wallet using various payment gateways.
      * Withdraw funds to your bank account.
      * View detailed transaction history.
  * **Watchlists**: Create and manage watchlists to track your favorite stocks and cryptocurrencies.
  * **Orders and Transactions**:
      * Place market, limit, and stop orders.
      * View your complete order history.
      * Track all your transactions in one place.
  * **Portfolio Management**: A comprehensive overview of your investments and performance.
  * **Community**: Engage with other traders and discuss market trends on the community page, which features posts from r/algotrading.

## 🛠️ APIs Used

  * **[Finnhub](https://finnhub.io/)**: For real-time stock and crypto data, as well as market news.
  * **[Polygon.io](https://polygon.io/)**: For historical stock and crypto data.
  * **[Razorpay](https://razorpay.com/)**: As a payment gateway for adding funds to the wallet.
  * **[PayU](https://payu.in/)**: An alternative payment gateway for seamless transactions.
  * **[Cashfree](https://www.cashfree.com/)**: For easy and secure payouts.
  * **[Reddit API](https://www.reddit.com/dev/api/)**: To fetch posts from r/algotrading for the community page.

## 🔐 Authentication

TradeView offers multiple ways to sign in:

  * **OAuth**:
      * Sign in with your **Google** account.
      * Sign in with your **GitHub** account.
  * **Credentials**:
      * Traditional **email and password** sign-in.

## 💳 Payment Gateways and Payouts

  * **Payment Gateways**:
      * **Razorpay**: A popular choice for secure and easy payments.
      * **PayU**: An alternative for reliable transactions.
  * **Payouts**:
      * **Cashfree**: For quick and hassle-free payouts to your bank account.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * Node.js (v18 or higher)
  * npm or yarn

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/gireesh27/trading-website.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env.local` file in the root directory and add the following environment variables:
    ```env
    # Next-Auth
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET= # Your secret here

    # Google OAuth
    GOOGLE_CLIENT_ID= # Your Google client ID
    GOOGLE_CLIENT_SECRET= # Your Google client secret

    # GitHub OAuth
    GITHUB_CLIENT_ID= # Your GitHub client ID
    GITHUB_CLIENT_SECRET= # Your GitHub client secret

    # MongoDB
    MONGODB_URI= # Your MongoDB connection string

    # APIs
    NEXT_PUBLIC_FINNHUB_API_KEY= # Your Finnhub API key
    NEXT_PUBLIC_POLYGON_API_KEY= # Your Polygon.io API key
    NEXT_PUBLIC_NEWS_API_KEY= # Your News API key

    # Payment Gateways
    NEXT_PUBLIC_RAZORPAY_KEY_ID= # Your Razorpay key ID
    NEXT_PUBLIC_RAZORPAY_KEY_SECRET= # Your Razorpay key secret
    NEXT_PUBLIC_PAYU_MERCHANT_KEY= # Your PayU merchant key
    NEXT_PUBLIC_PAYU_SALT= # Your PayU salt

    # Payouts
    CASHFREE_CLIENT_ID= # Your Cashfree client ID
    CASHFREE_CLIENT_SECRET= # Your Cashfree client secret

    # Reddit API
    REDDIT_CLIENT_ID= # Your Reddit client ID
    REDDIT_CLIENT_SECRET= # Your Reddit client secret
    REDDIT_USER_AGENT= # Your Reddit user agent
    ```
4.  Run the development server
    ```sh
    npm run dev
    ```
5.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

## 🖼️ Screenshots

*You can add screenshots of your application here to showcase its features.*

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Author and CopyRights:
Gireesh Kasa




-----
