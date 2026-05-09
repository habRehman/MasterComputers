/**
 * Master Computers — MongoDB Seed Script
 * =======================================
 * Run this ONCE to fill your database with categories, products,
 * and test accounts.
 *
 * Usage (from the backend/ folder):
 *   node scripts/seed.js
 *
 * What it creates:
 *   - 8 product categories
 *   - 37 Pakistani market products with PKR prices
 *   - 1 admin account  → admin@mastercomputers.pk / admin123
 *   - 1 demo customer  → demo@example.com / demo1234
 *
 * NOTE: The pre-save hook in User.js hashes passwords automatically.
 *       We pass plain-text passwords here; User.create() triggers the hook.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const User     = require('../models/User')
const Category = require('../models/Category')
const Product  = require('../models/Product')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/master_computers'

// ─── CATEGORIES ──────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Laptops',       slug: 'laptops',      icon: '💻' },
  { name: 'Desktops',      slug: 'desktops',     icon: '🖥️' },
  { name: 'Mobile Phones', slug: 'mobiles',      icon: '📱' },
  { name: 'Monitors',      slug: 'monitors',     icon: '🖥'  },
  { name: 'Components',    slug: 'components',   icon: '⚙️' },
  { name: 'Accessories',   slug: 'accessories',  icon: '🖱️' },
  { name: 'Networking',    slug: 'networking',   icon: '📡' },
  { name: 'Storage',       slug: 'storage',      icon: '💾' },
]

// ─── PRODUCTS ────────────────────────────────────────────────
// Organised by category slug so we can look up the _id after inserting categories
const PRODUCTS_BY_CATEGORY = {
  laptops: [
    {
      name: 'Dell Inspiron 15 3520',
      description: 'Reliable everyday laptop ideal for students and office use. Available at Hafeez Center Lahore and Saddar Karachi.',
      price: 145000, original_price: 155000,
      brand: 'Dell', model: 'Inspiron 3520', stock: 20, image_url: 'https://www.qtechempire.com/wp-content/uploads/2024/05/dell-inspiron-15-3520-1585sg-512-w11-156-fhd-120hz-laptop-platinum-silver-i3-1215u-8gb-512gb-ssd-intel-w11-2.jpg',
      is_featured: true,
      specs: new Map([['Processor','Intel Core i5-1235U'],['RAM','8GB DDR4'],['Storage','512GB SSD'],['Display','15.6" FHD'],['OS','Windows 11'],['Warranty','1 Year Dell Pakistan']]),
    },
    {
      name: 'HP Pavilion 15-eg2000',
      description: 'Powerful HP Pavilion laptop for students and professionals.',
      price: 168000,
      original_price: 180000,
      brand: 'HP',
      model: 'Pavilion 15-eg2000',
      stock: 15,
      image_url: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08099876.png',
      is_featured: true,
      specs: new Map([
        ['Processor','Intel Core i5-1335U'],
        ['RAM','16GB DDR4'],
        ['Storage','512GB SSD'],
        ['Display','15.6" FHD IPS']
      ])
    },
    {
      name: 'Lenovo ThinkPad E14 Gen 5',
      description: 'Business-class laptop with durable build and performance.',
      price: 210000,
      original_price: 225000,
      brand: 'Lenovo',
      model: 'ThinkPad E14 Gen 5',
      stock: 10,
      image_url: 'https://p4-ofp.static.pub/ShareResource/na/products/thinkpad/2023-e14-gen5/hero.png',
      is_featured: false,
      specs: new Map([
        ['Processor','Intel Core i7-1355U'],
        ['RAM','16GB DDR4'],
        ['Storage','512GB SSD']
      ])
    },
    {
      name: 'HP Laptop 15s-fq5000',
      description: 'Budget-friendly HP laptop, top seller in Karachi and Lahore markets. Great for students.',
      price: 129000, original_price: 135000,
      brand: 'HP', model: '15s-fq5000', stock: 30, image_url: 'https://laptopmart.pk/wp-content/uploads/2023/01/HP-15s-FQ5009nl.jpg',
      is_featured: true,
      specs: new Map([['Processor','Intel Core i3-1215U'],['RAM','8GB DDR4'],['Storage','256GB SSD'],['Display','15.6" FHD'],['OS','Windows 11 Home'],['Warranty','1 Year HP Pakistan']]),
    },
    {
      name: 'Lenovo IdeaPad Slim 3',
      description: 'Slim and lightweight laptop with great battery life. Very popular in Pakistani universities.',
      price: 138000, original_price: 145000,
      brand: 'Lenovo', model: 'IdeaPad Slim 3', stock: 25, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9pkzLPvJCeYDujQlN77JhvjbvSmxKs7nkjQ&s',
      is_featured: true,
      specs: new Map([['Processor','AMD Ryzen 5 7520U'],['RAM','8GB LPDDR5'],['Storage','512GB SSD'],['Display','15.6" FHD IPS'],['OS','Windows 11'],['Warranty','1 Year Lenovo Pakistan']]),
    },
    {
      name: 'ASUS VivoBook 15',
      description: 'Stylish and powerful laptop. Available at Hafeez Center Lahore and Saddar Karachi.',
      price: 155000, original_price: 162000,
      brand: 'ASUS', model: 'VivoBook 15 X1502', stock: 18, image_url: 'https://m.media-amazon.com/images/I/51g7RJH-nQL._AC_SL1000_.jpg',
      is_featured: false,
      specs: new Map([['Processor','Intel Core i5-12500H'],['RAM','16GB DDR4'],['Storage','512GB NVMe SSD'],['Display','15.6" FHD 144Hz'],['OS','Windows 11'],['Warranty','1 Year ASUS Pakistan']]),
    },
    {
      name: 'MSI Modern 14',
      description: 'Professional ultrabook for business users. Available in major Pakistani cities.',
      price: 189000, original_price: 198000,
      brand: 'MSI', model: 'Modern 14 C12M', stock: 12, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPZv_9zEmw-nRPvI--X9YRvynH3qNzkk3Xig&s',
      is_featured: false,
      specs: new Map([['Processor','Intel Core i7-1255U'],['RAM','16GB DDR4'],['Storage','1TB NVMe SSD'],['Display','14" FHD IPS'],['OS','Windows 11 Pro'],['Warranty','1 Year MSI Pakistan']]),
    },
    {
      name: 'Apple MacBook Air M2',
      description: 'Premium laptop. Available at iCare and authorized Apple resellers in Pakistan.',
      price: 385000, original_price: 399000,
      brand: 'Apple', model: 'MacBook Air M2', stock: 8, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoVBIPfHEvGgCFVfK8y6d5ClkCRcxE-DBUZg&s',
      is_featured: true,
      specs: new Map([['Processor','Apple M2 8-Core'],['RAM','8GB Unified'],['Storage','256GB SSD'],['Display','13.6" Liquid Retina'],['OS','macOS Sonoma'],['Warranty','1 Year Apple Care']]),
    },
    {
      name: 'Acer Aspire 5',
      description: 'Best value for money laptop in Pakistan. Top seller at Metro Electronics.',
      price: 122000, original_price: 128000,
      brand: 'Acer', model: 'Aspire 5 A515', stock: 35, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMMa7Lkh65NyXAfWeu5DcnfEvYm1a-OqpYEg&s',
      is_featured: true,
      specs: new Map([['Processor','AMD Ryzen 5 7530U'],['RAM','8GB DDR4'],['Storage','512GB SSD'],['Display','15.6" FHD IPS'],['OS','Windows 11'],['Warranty','1 Year Acer Pakistan']]),
    },
    {
      name: 'Dell XPS 15',
      description: 'Premium performance laptop for professionals and content creators.',
      price: 425000, original_price: 450000,
      brand: 'Dell', model: 'XPS 15 9530', stock: 5, image_url: 'https://static.webx.pk/files/17888/Images/download-17888-0-150823092238831.jpeg',
      is_featured: false,
      specs: new Map([['Processor','Intel Core i7-13700H'],['RAM','16GB DDR5'],['Storage','512GB NVMe'],['Display','15.6" OLED 3.5K'],['OS','Windows 11 Pro'],['Warranty','1 Year Dell Pakistan']]),
    },
  ],
  mobiles: [
    {
      name: 'Samsung Galaxy A55 5G',
      description: 'Most popular mid-range phone in Pakistan. Available at all mobile markets.',
      price: 89000, original_price: 95000,
      brand: 'Samsung', model: 'Galaxy A55 5G', stock: 50, image_url: 'https://d1iv6qgcmtzm6l.cloudfront.net/product_galleries/lg_PsnMQrBuP3Ah0LoaJIeAcXTCklnsokymDjKdesj4.jpg',
      is_featured: true,
      specs: new Map([['Processor','Exynos 1480'],['RAM','8GB'],['Storage','256GB'],['Display','6.6" Super AMOLED 120Hz'],['Camera','50MP+12MP+5MP'],['Battery','5000mAh'],['OS','Android 14']]),
    },
    {
      name: 'Xiaomi Redmi Note 13 Pro',
      description: 'Budget king in Pakistan. Excellent camera at an affordable price.',
      price: 65000, original_price: 69000,
      brand: 'Xiaomi', model: 'Redmi Note 13 Pro', stock: 60, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9jgysqugzQpDQBifjKlZPfKsNaHaGjIxncQ&s',
      is_featured: true,
      specs: new Map([['Processor','Helio G99 Ultra'],['RAM','8GB'],['Storage','256GB'],['Display','6.67" AMOLED 120Hz'],['Camera','200MP'],['Battery','5100mAh'],['OS','Android 13']]),
    },
    {
      name: 'Realme C67',
      description: 'Ultra budget smartphone popular in small cities and towns across Pakistan.',
      price: 35000, original_price: 38000,
      brand: 'Realme', model: 'C67', stock: 80, image_url: 'https://ustoreseg.com/wp-content/uploads/2025/07/RC6756.jpg',
      is_featured: false,
      specs: new Map([['Processor','Snapdragon 685'],['RAM','6GB'],['Storage','128GB'],['Display','6.72" FHD+ 90Hz'],['Camera','108MP'],['Battery','5000mAh'],['OS','Android 13']]),
    },
    {
      name: 'QMobile Phantom X5',
      description: 'Local Pakistani brand. Affordable smartphone with decent specs for daily use.',
      price: 28000, original_price: 30000,
      brand: 'QMobile', model: 'Phantom X5', stock: 40, image_url: 'https://qmobile.com.pk/cdn/shop/files/Main-Image_b28731e4-3f6d-4de8-9df6-8771d78eab96.png?v=1717603758',
      is_featured: false,
      specs: new Map([['Processor','MediaTek Helio G85'],['RAM','4GB'],['Storage','128GB'],['Display','6.5" HD+'],['Camera','48MP'],['Battery','5000mAh'],['OS','Android 12']]),
    },
    {
      name: 'Samsung Galaxy A15',
      description: 'Budget Samsung phone with AMOLED display.',
      price: 45000,
      original_price: 48000,
      brand: 'Samsung',
      model: 'Galaxy A15',
      stock: 60,
      image_url: 'https://images.samsung.com/pk/smartphones/galaxy-a15/images/galaxy-a15.png',
      is_featured: true,
      specs: new Map([
        ['RAM','6GB'],
        ['Storage','128GB'],
        ['Battery','5000mAh']
      ])
    },
    {
      name: 'Infinix Zero 30',
      description: 'High performance phone popular in Pakistan.',
      price: 70000,
      original_price: 75000,
      brand: 'Infinix',
      model: 'Zero 30',
      stock: 40,
      image_url: 'https://fdn2.gsmarena.com/vv/pics/infinix/infinix-zero-30-5g-1.jpg',
      is_featured: false,
      specs: new Map([
        ['RAM','8GB'],
        ['Storage','256GB'],
        ['Camera','108MP']
      ])
    },
    {
      name: 'iPhone 15',
      description: 'Available at authorized Apple resellers. iCare and iFix stores across Pakistan.',
      price: 329000, original_price: 345000,
      brand: 'Apple', model: 'iPhone 15', stock: 15, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrl5tECcP9p9yqqenrrFwas_lBXZwgEq6t5Q&s',
      is_featured: true,
      specs: new Map([['Processor','Apple A16 Bionic'],['RAM','6GB'],['Storage','128GB'],['Display','6.1" Super Retina XDR OLED'],['Camera','48MP+12MP'],['Battery','3349mAh'],['OS','iOS 17']]),
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Flagship Samsung phone available at Samsung Experience Stores in Pakistan.',
      price: 199000, original_price: 210000,
      brand: 'Samsung', model: 'Galaxy S24', stock: 20, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIbn1ON05g4rbNS837lB5gXKwumWZIoHtyuw&s',
      is_featured: true,
      specs: new Map([['Processor','Snapdragon 8 Gen 3'],['RAM','8GB'],['Storage','256GB'],['Display','6.2" Dynamic AMOLED 120Hz'],['Camera','50MP+12MP+10MP'],['Battery','4000mAh'],['OS','Android 14']]),
    },
    {
      name: 'Tecno Spark 20 Pro',
      description: 'Budget smartphone by Tecno, popular in Pakistan lower-income market segment.',
      price: 32000, original_price: 35000,
      brand: 'Tecno', model: 'Spark 20 Pro', stock: 55, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFA8f3MZ2XX5-pPqm3btbE-po057lV6AZm7A&s',
      is_featured: false,
      specs: new Map([['Processor','Helio G99'],['RAM','8GB'],['Storage','256GB'],['Display','6.78" AMOLED 120Hz'],['Camera','108MP'],['Battery','5000mAh'],['OS','Android 13']]),
    },
  ],
  desktops: [
    {
      name: 'Dell OptiPlex 7090',
      description: 'Business desktop PC widely used in offices.',
      price: 95000,
      original_price: 105000,
      brand: 'Dell',
      model: 'OptiPlex 7090',
      stock: 20,
      image_url: 'https://i.dell.com/sites/imagecontent/products/PublishingImages/optiplex-7090/desktop.png',
      is_featured: true,
      specs: new Map([
        ['Processor','Intel Core i5 10th Gen'],
        ['RAM','8GB'],
        ['Storage','256GB SSD']
      ])
    },
    {
      name: 'HP ProDesk 400 G7',
      description: 'Reliable office desktop with solid performance.',
      price: 88000,
      original_price: 95000,
      brand: 'HP',
      model: 'ProDesk 400 G7',
      stock: 15,
      image_url: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c06960264.png',
      is_featured: false,
      specs: new Map([
        ['Processor','Intel Core i5'],
        ['RAM','8GB'],
        ['Storage','512GB SSD']
      ])
    }
  ],
  monitors: [
    {
      name: 'Dell 24" FHD Monitor',
      description: 'Most popular office monitor in Pakistan. Available at all major IT shops.',
      price: 32000, original_price: 35000,
      brand: 'Dell', model: 'D2421H', stock: 40, image_url: 'https://acom.pk/cdn/shop/files/81h8db3IKoL._AC_SX425.jpg?v=1726741614',
      is_featured: true,
      specs: new Map([['Size','24 inch'],['Resolution','1920x1080 FHD'],['Panel','IPS'],['Refresh Rate','60Hz'],['Ports','VGA, HDMI'],['Warranty','3 Years Dell Pakistan']]),
    },
    {
      name: 'AOC 27" Gaming Monitor',
      description: 'Popular gaming monitor at Hafeez Center and Akbar Chowk markets.',
      price: 52000, original_price: 58000,
      brand: 'AOC', model: '27G2SP', stock: 22, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYlYWFnNsOceZcdOk1qIDoil5dQ6BH5dp9QA&s',
      is_featured: false,
      specs: new Map([['Size','27 inch'],['Resolution','1920x1080 FHD'],['Panel','IPS'],['Refresh Rate','165Hz'],['Ports','HDMI, DisplayPort'],['Warranty','3 Years']]),
    },
    {
      name: 'Samsung 32" Curved Monitor',
      description: '32-inch curved monitor perfect for multitasking. Available in Karachi and Lahore.',
      price: 68000, original_price: 75000,
      brand: 'Samsung', model: 'C32F391FW', stock: 15, image_url: 'https://image-us.samsung.com/SamsungUS/pim/migration/computing/monitors/led/lc32f391fwnxza/Pdpdefault-lc32f391fwnxza-600x600-C1-052016.jpg?$product-details-jpg$',
      is_featured: false,
      specs: new Map([['Size','32 inch'],['Resolution','1920x1080 FHD'],['Panel','VA Curved'],['Refresh Rate','60Hz'],['Ports','HDMI, VGA'],['Warranty','2 Years Samsung Pakistan']]),
    },
    {
      name: 'Haier 22" LED Monitor',
      description: 'Pakistani brand Haier. Budget monitor popular for home and small office use.',
      price: 22000, original_price: 24000,
      brand: 'Haier', model: 'HLP22BB', stock: 50, image_url: 'https://i.gadgets360cdn.com/products/televisions/large/1548154178_832_haier_22-inch-led-full-hd-tv-le22b600.jpg',
      is_featured: false,
      specs: new Map([['Size','22 inch'],['Resolution','1920x1080 FHD'],['Panel','TN'],['Refresh Rate','60Hz'],['Ports','VGA, HDMI'],['Warranty','2 Years Haier Pakistan']]),
    },
  ],
  components: [
    {
      name: 'AMD Ryzen 5 5600X',
      description: 'Best budget gaming CPU in Pakistan. Available at all PC building shops.',
      price: 25000, original_price: 28000,
      brand: 'AMD', model: 'Ryzen 5 5600X', stock: 30, image_url: 'https://static.webx.pk/files/2603/Images/2365-front-2603-2179100-260824105250428.jpg',
      is_featured: true,
      specs: new Map([['Cores','6C/12T'],['Boost Clock','4.6GHz'],['TDP','65W'],['Socket','AM4'],['Cache','35MB'],['Warranty','3 Years']]),
    },
    {
      name: 'NVIDIA RTX 4060',
      description: 'Mid-range GPU popular among Pakistani gamers. Available at Hafeez Center Lahore.',
      price: 95000, original_price: 102000,
      brand: 'NVIDIA/Gigabyte', model: 'RTX 4060 Eagle OC', stock: 12, image_url: 'https://www.nvidia.com/content/dam/en-zz/Solutions/geforce/ada/rtx-4060-4060ti/geforce-rtx-4060-ti-og-1200x630.jpg',
      is_featured: true,
      specs: new Map([['VRAM','8GB GDDR6'],['Boost Clock','2475MHz'],['TDP','115W'],['Ports','HDMI 2.1, DP 1.4'],['Warranty','3 Years Gigabyte Pakistan']]),
    },
    {
      name: 'Corsair 16GB DDR4 3200MHz',
      description: 'Popular RAM kit for PC builds in Pakistan.',
      price: 8500, original_price: 9500,
      brand: 'Corsair', model: 'Vengeance LPX 16GB', stock: 60, image_url: 'https://img.drz.lazcdn.com/static/pk/p/0c9138479f72e8b88c74fde25194c2fb.jpg_720x720q80.jpg',
      is_featured: false,
      specs: new Map([['Capacity','16GB (2x8GB)'],['Speed','3200MHz DDR4'],['Latency','CL16'],['Voltage','1.35V'],['Warranty','Lifetime Corsair']]),
    },
    {
      name: 'WD 1TB NVMe SSD',
      description: 'Fast NVMe SSD. Available across Pakistan. Popular laptop upgrade.',
      price: 18000, original_price: 20000,
      brand: 'Western Digital', model: 'WD Blue SN580', stock: 45, image_url: 'https://static.webx.pk/files/4012/Images/ff-4012-2478957-301025015322464.webp',
      is_featured: false,
      specs: new Map([['Capacity','1TB'],['Interface','NVMe PCIe 4.0'],['Read Speed','4150MB/s'],['Write Speed','4150MB/s'],['Warranty','5 Years WD']]),
    },
    {
      name: 'Intel Core i5-12400F',
      description: 'Budget gaming CPU from Intel. Requires a discrete GPU.',
      price: 28000, original_price: 31000,
      brand: 'Intel', model: 'Core i5-12400F', stock: 20, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_Bwov6RDgUDJtfPweX1K607l29XFpeUv4uA&s',
      is_featured: false,
      specs: new Map([['Cores','6C/12T'],['Boost Clock','4.4GHz'],['TDP','65W'],['Socket','LGA1700'],['Cache','18MB'],['Warranty','3 Years']]),
    },
  ],
  accessories: [
    {
      name: 'Logitech MK235 Keyboard + Mouse',
      description: 'Most popular wireless combo in Pakistan. Used in offices and homes nationwide.',
      price: 4500, original_price: 5000,
      brand: 'Logitech', model: 'MK235', stock: 100, image_url: 'https://static.webx.pk/files/78721/Images/51td5qfiesl.-ac-sl1000--78721-2201032-200924075445862.jpg',
      is_featured: true,
      specs: new Map([['Type','Wireless Keyboard + Mouse Combo'],['Connectivity','2.4GHz USB Nano'],['Battery Life','24 months keyboard'],['Warranty','1 Year Logitech Pakistan']]),
    },
    {
      name: 'Audionic Max-15 Bluetooth Speaker',
      description: 'Pakistani brand Audionic. Very popular portable speaker across Pakistan.',
      price: 3500, original_price: 4000,
      brand: 'Audionic', model: 'Max-15', stock: 80, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-KpQJ2F38CFQaRz4J7D8olmvD37jjV7G7vw&s',
      is_featured: false,
      specs: new Map([['Type','Bluetooth Speaker'],['Connectivity','Bluetooth 5.0'],['Battery','1500mAh'],['Waterproof','IPX5'],['Warranty','1 Year Audionic Pakistan']]),
    },
    {
      name: 'Microtek 1200VA UPS',
      description: 'Essential in Pakistan due to load shedding. Available at all electronics markets.',
      price: 18000, original_price: 20000,
      brand: 'Microtek', model: 'EB 1200', stock: 35, image_url: 'https://ipsmart.org/wp-content/uploads/2023/02/Microtek-Luxe-1200VA.jpg',
      is_featured: true,
      specs: new Map([['Capacity','1200VA / 720W'],['Backup Time','30–45 mins'],['Battery','12V 9Ah'],['Type','Offline UPS'],['Warranty','2 Years with Battery']]),
    },
    {
      name: 'Sony WH-CH520 Headphones',
      description: 'Wireless headphones with excellent battery life.',
      price: 12000,
      original_price: 14000,
      brand: 'Sony',
      model: 'WH-CH520',
      stock: 40,
      image_url: 'https://sony.scene7.com/is/image/sonyglobalsolutions/wh-ch520_primary_image_black',
      is_featured: true,
      specs: new Map([
        ['Battery','50 Hours'],
        ['Connectivity','Bluetooth 5.2'],
        ['Type','Over Ear']
      ])
    },
    {
      name: 'Redragon K552 Mechanical Keyboard',
      description: 'Gaming mechanical keyboard with RGB lighting.',
      price: 6500,
      original_price: 7500,
      brand: 'Redragon',
      model: 'K552',
      stock: 70,
      image_url: 'https://redragonshop.com/cdn/shop/products/K552-KR-1.jpg',
      is_featured: false,
      specs: new Map([
        ['Switch','Mechanical'],
        ['Lighting','RGB'],
        ['Connection','Wired']
      ])
    },
    {
      name: 'Anker 65W GaN Charger',
      description: 'Fast charger popular in Pakistan. Available online and at mobile shops.',
      price: 3800, original_price: 4200,
      brand: 'Anker', model: 'Nano Pro 65W', stock: 60, image_url: 'https://m.media-amazon.com/images/I/317KiTziKPL._SL500_.jpg',
      is_featured: false,
      specs: new Map([['Power','65W'],['Ports','2x USB-C + 1x USB-A'],['Technology','GaN II'],['Compatible With','Laptops, phones, tablets'],['Warranty','18 Months Anker']]),
    },
  ],
  networking: [
    {
      name: 'TP-Link Archer AX3000 WiFi 6 Router',
      description: 'Popular WiFi 6 router in Pakistan. Works great with PTCL and Nayatel fiber.',
      price: 12500, original_price: 14000,
      brand: 'TP-Link', model: 'Archer AX3000', stock: 30, image_url: 'https://static.webx.pk/files/70503/Images/14-czone.com.pk-1540-16691-070824092715-70503-0-211024092207607.jpg',
      is_featured: true,
      specs: new Map([['Standard','WiFi 6 802.11ax'],['Speed','3000Mbps'],['Bands','Dual Band'],['Ports','4x Gigabit LAN + 1x WAN'],['Warranty','2 Years TP-Link Pakistan']]),
    },
    {
      name: 'TP-Link USB WiFi Adapter',
      description: 'Budget WiFi adapter for desktop PCs without built-in WiFi.',
      price: 1800, original_price: 2200,
      brand: 'TP-Link', model: 'TL-WN823N', stock: 120, image_url: 'https://static.webx.pk/files/78721/Images/823n-1-78721-2196768-140924054859851.jpg',
      is_featured: false,
      specs: new Map([['Standard','802.11n'],['Speed','300Mbps'],['Interface','USB 2.0'],['Antenna','External'],['Warranty','2 Years TP-Link Pakistan']]),
    },
  ],
  storage: [
    {
      name: 'Seagate 1TB External HDD',
      description: 'Portable hard drive. Very popular in Pakistan for data backup and storage.',
      price: 7500, original_price: 8500,
      brand: 'Seagate', model: 'Expansion 1TB', stock: 70, image_url: 'https://static.webx.pk/files/70503/Images/11-czone.com.pk-1540-12537-061222080843-70503-0-291123065111128.jpg',
      is_featured: true,
      specs: new Map([['Capacity','1TB'],['Interface','USB 3.0'],['Speed','5Gbps'],['Form Factor','2.5 inch'],['Warranty','2 Years Seagate Pakistan']]),
    },
    {
      name: 'SanDisk 256GB USB Flash Drive',
      description: 'High speed USB 3.1 pen drive. Available everywhere in Pakistan.',
      price: 3200, original_price: 3800,
      brand: 'SanDisk', model: 'Ultra Flair 256GB', stock: 100, image_url: 'https://m.media-amazon.com/images/I/61b1t3sW4DL._SL1500_.jpg',
      is_featured: false,
      specs: new Map([['Capacity','256GB'],['Interface','USB 3.1'],['Read Speed','150MB/s'],['Form Factor','Compact'],['Warranty','5 Years SanDisk']]),
    },
  ],
}

// ─── SEED FUNCTION ───────────────────────────────────────────
async function seed() {
  console.log('\n╔══════════════════════════════════════╗')
  console.log('║   Master Computers — DB Seed Script  ║')
  console.log('╚══════════════════════════════════════╝\n')

  console.log(`[1/6] Connecting to MongoDB...`)
  await mongoose.connect(MONGODB_URI)
  console.log(`      ✅ Connected to: ${MONGODB_URI}\n`)

  console.log('[2/6] Clearing old data...')
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})])
  console.log('      ✅ Collections cleared\n')

  console.log('[3/6] Inserting categories...')
  const categoryDocs = await Category.insertMany(CATEGORIES)
  const categoryMap  = Object.fromEntries(categoryDocs.map(c => [c.slug, c._id]))
  console.log(`      ✅ Inserted ${categoryDocs.length} categories\n`)

  console.log('[4/6] Inserting products...')
  let totalProducts = 0
  for (const [slug, prods] of Object.entries(PRODUCTS_BY_CATEGORY)) {
    const catId = categoryMap[slug]
    if (!catId) { console.warn(`      ⚠️  No category found for slug: ${slug}`); continue }
    const docs = prods.map(p => ({ ...p, category: catId }))
    await Product.insertMany(docs)
    console.log(`      ✔  ${slug}: ${docs.length} products`)
    totalProducts += docs.length
  }
  console.log(`\n      ✅ Inserted ${totalProducts} products total\n`)

  // ── Admin user ──────────────────────────────────────────
  // IMPORTANT: We pass plain-text password here.
  // User.create() triggers the pre('save') hook in User.js
  // which calls bcrypt.hash() automatically.
  // DO NOT pre-hash the password here or it will be double-hashed.
  console.log('[5/6] Creating admin user...')
  await User.create({
    email:     'admin@mastercomputers.pk',
    password:  'admin123',          // plain text → hook hashes it
    full_name: 'Admin',
    role:      'admin',
    city:      'Lahore',
  })
  console.log('      ✅ Admin created')
  console.log('         Email:    admin@mastercomputers.pk')
  console.log('         Password: admin123\n')

  // ── Demo customer ───────────────────────────────────────
  console.log('[6/6] Creating demo customer...')
  await User.create({
    email:     'demo@example.com',
    password:  'demo1234',          // plain text → hook hashes it
    full_name: 'Ali Hassan',
    phone:     '0300-1234567',
    city:      'Karachi',
    role:      'customer',
  })
  console.log('      ✅ Demo customer created')
  console.log('         Email:    demo@example.com')
  console.log('         Password: demo1234\n')

  console.log('╔══════════════════════════════════════╗')
  console.log('║  ✅  Database seeded successfully!   ║')
  console.log('╚══════════════════════════════════════╝\n')
  console.log('⚠️  Change admin123 and demo1234 before going live!\n')

  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message)
  if (err.message.includes('ECONNREFUSED')) {
    console.error('   MongoDB is not running!')
    console.error('   Start it with: net start MongoDB')
  }
  process.exit(1)
})