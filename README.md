Bazar is a multi‑tier online book store built as part of the Distributed Operating Systems (DOS) course. It follows a classic 3‑tier architecture (front‑end, catalog/service, order/checkout) and enables users to search for books, view details, and place orders. 
github.com

🚀 Features

🔍 Book Search – Query books by title, author, or topic

📘 Detailed Page – View book descriptions, price, availability

🛒 Order Processing – Add to cart and place orders

🛠️ 3‑Tier Architecture –

Frontend: User interface (e.g. web UI or lightweight client)

Catalog Service: Manages book data and search functionality

Order Service: Handles shopping cart and order placement

📁 Repository Structure
/
├── catalogServer/        # Backend service for book catalog & search
├── gatewaySever/         # FrontEnd for using this application
├── orderServer/          # Backend service for order/cart workflows
