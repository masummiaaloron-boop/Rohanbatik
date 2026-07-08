# Premium Glassmorphism eCommerce Landing Platform

A luxurious, fully-functional premium one-page eCommerce landing storefront built with **pure HTML5, CSS3, and Vanilla JavaScript**. Optimized for high-performance static hosting environments like GitHub Pages or Vercel with zero configurations or build steps.

## 💎 Features
- **Responsive Premium Glassmorphism UI**: Beautiful, clean UI with custom backdrop-filter styling, glowing borders, smooth layout transitions, and fluid micro-interactions.
- **Dynamic Hero Banner Slider**: Draggable/clickable sliding hero banner system with automated auto-slide transitions.
- **Fully Functional Shopping Cart & Wishlist**: Side-drawers with custom responsive drawer overlays, live badge quantity counters, and precise subtotal + delivery + discount calculations.
- **Product Details Subpage (`product.html`)**: Rich item view page complete with image display, star-rating render, and custom incremental quantity selector.
- **Secure Cash on Delivery (COD) Checkout (`checkout.html`)**: Polished shipping/billing form validating inputs, integrating custom coupon discounts, and tracking real-time delivery fee adjustments.
- **Dynamic Order Success Tracker (`success.html`)**: Interactive post-checkout receipt showing unique, randomly generated Order IDs.
- **Comprehensive Admin Panel Dashboard (`admin.html`)**:
  - Secure LocalStorage authentication (`admin` / `admin123`).
  - Active products, categories, slider banners, customer FAQs, and client testimonials manager (full Add, Edit, Delete workflows with Base64 LocalStorage image file uploads!).
  - Live order tracker (Pending, Confirmed, Delivered, Cancelled statuses) with customer search filters.
  - Analytics cards with automated count animations and a custom pure CSS performance chart.
  - One-click **Export Orders JSON** button.
- **SEO & Global Settings Manager**: Easily modify site name, branding color, announcement banners, active discounts, contact phone numbers, social media links (WhatsApp, TikTok, etc.), and marketing entrance popup triggers.
- **Dark & Light Modes**: Seamless global theme sync persisting in LocalStorage.
- **Entrance Popups, Announcement Tickers & Toast Notifications**: Built-in native feedback systems.

## 📁 Project Structure
```text
index.html         - Main Luxury eCommerce Landing Page
product.html       - Interactive Product Detail Page
checkout.html      - Secure Shipping & Payment (COD) Form
success.html       - Polished Order Receipt & Success Landing
login.html         - Administrator Authentication Portal
admin.html         - Administrative Management Dashboard
assets/
  ├── css/
  │    └── style.css  - Main Premium Glassmorphism Stylesheet
  └── js/
       ├── db.js      - LocalStorage Data Model & Demo Data Engine
       ├── main.js    - Front Store Controller (Cart, Slider, FAQ, Filters)
       └── admin.js   - Back Office Controller (Analytics, Status, Settings)
```

## 🚀 Deployment Instructions
This website runs completely client-side in the browser. 

1. **Deploy to Vercel**: 
   Simply import the folder or connect your GitHub repository to Vercel. Select **Other / Static** or do not specify any framework preset.
2. **Deploy to GitHub Pages**:
   Push the files to a repository on GitHub, navigate to **Settings > Pages**, select the branch (`main` / `master`) as source, and save!
