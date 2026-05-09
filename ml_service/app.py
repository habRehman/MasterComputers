"""
╔══════════════════════════════════════════════════════════════════╗
║         Master Computers — ML Service (Python Flask)            ║
║  K-Means Recommendations + Multi-Category Price Prediction      ║
║  Pakistani Market Prices (PKR) — 2024-2025                      ║
║                                                                  ║
║  Run:  python app.py   →  listens on http://localhost:5001       ║
╚══════════════════════════════════════════════════════════════════╝
"""

import os, re, math
from flask import Flask, request, jsonify, make_response
import numpy as np
import pandas as pd
from sklearn.cluster      import KMeans
from sklearn.linear_model import Ridge
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics       import r2_score, mean_absolute_error
from sklearn.model_selection import train_test_split
import joblib

app = Flask(__name__)

# ═══════════════════════════════════════════════════════════════════
#  PRODUCT CATALOGUE  (for K-Means clustering)
# ═══════════════════════════════════════════════════════════════════
PRODUCTS_DATA = [
    # id  name                         category      brand      price   ram  storage  mobile
    (1,  "Dell Inspiron 15",          "laptops",    "Dell",   145000,  8,   512,    0),
    (2,  "HP 15s-fq5000",             "laptops",    "HP",     129000,  8,   256,    0),
    (3,  "Lenovo IdeaPad Slim 3",     "laptops",    "Lenovo", 138000,  8,   512,    0),
    (4,  "ASUS VivoBook 15",          "laptops",    "ASUS",   155000, 16,   512,    0),
    (5,  "MSI Modern 14",             "laptops",    "MSI",    189000, 16,  1000,    0),
    (6,  "Apple MacBook Air M2",      "laptops",    "Apple",  385000,  8,   256,    0),
    (7,  "Acer Aspire 5",             "laptops",    "Acer",   122000,  8,   512,    0),
    (8,  "Dell XPS 15",               "laptops",    "Dell",   425000, 16,   512,    0),
    (9,  "Samsung Galaxy A55 5G",     "mobiles",    "Samsung", 89000,  8,   256,    1),
    (10, "Xiaomi Redmi Note 13 Pro",  "mobiles",    "Xiaomi",  65000,  8,   256,    1),
    (11, "Realme C67",                "mobiles",    "Realme",  35000,  6,   128,    1),
    (12, "QMobile Phantom X5",        "mobiles",    "QMobile", 28000,  4,   128,    1),
    (13, "iPhone 15",                 "mobiles",    "Apple",  329000,  6,   128,    1),
    (14, "Samsung Galaxy S24",        "mobiles",    "Samsung",199000,  8,   256,    1),
    (15, "Tecno Spark 20 Pro",        "mobiles",    "Tecno",   32000,  8,   256,    1),
    (16, "Dell 24 FHD Monitor",       "monitors",   "Dell",    32000,  0,     0,    0),
    (17, "AOC 27 Gaming Monitor",     "monitors",   "AOC",     52000,  0,     0,    0),
    (18, "Samsung 32 Curved",         "monitors",   "Samsung", 68000,  0,     0,    0),
    (19, "Haier 22 LED Monitor",      "monitors",   "Haier",   22000,  0,     0,    0),
    (20, "AMD Ryzen 5 5600X",         "components", "AMD",     25000,  0,     0,    0),
    (21, "NVIDIA RTX 4060",           "components", "NVIDIA",  95000,  0,     0,    0),
    (22, "Corsair 16GB DDR4",         "accessories","Corsair",  8500, 16,     0,    0),
    (23, "WD 1TB NVMe SSD",           "storage",    "WD",      18000,  0,  1000,    0),
    (24, "Seagate 1TB HDD",           "storage",    "Seagate",  7500,  0,  1000,    0),
    (25, "Logitech MK235 Combo",      "accessories","Logitech",  4500, 0,     0,    0),
    (26, "Microtek 1200VA UPS",       "accessories","Microtek", 18000, 0,     0,    0),
    (27, "Anker 65W GaN Charger",     "accessories","Anker",    3800,  0,     0,    0),
    (28, "TP-Link AX3000 Router",     "networking", "TP-Link", 12500,  0,     0,    0),
    (29, "TP-Link USB WiFi Adapter",  "networking", "TP-Link",  1800,  0,     0,    0),
]

# ═══════════════════════════════════════════════════════════════════
#  SEPARATE TRAINING DATASETS PER CATEGORY
#
#  Each category has its own Linear Regression model trained on
#  category-specific features. This is FAR more accurate than a
#  single model trying to price everything from laptops to routers.
#
#  Category models and their features:
#    laptops     → [ram, storage, is_premium, screen_size]
#    mobiles     → [ram, storage, is_premium, camera_mp]
#    monitors    → [screen_size, is_gaming, is_curved, is_premium]
#    components  → [component_type, tier, vram_or_cores]
#    storage     → [capacity_gb, is_ssd, is_nvme]
#    accessories → [accessory_type, tier]
#    networking  → [speed_mbps, is_wifi6]
# ═══════════════════════════════════════════════════════════════════

# ── LAPTOPS: [ram_gb, storage_gb, is_premium, screen_inches, price] ─
LAPTOP_DATA = [
    # Budget — local and mid-tier brands
    [2,    64,  0, 15.6,  55000],
    [4,   128,  0, 15.6,  72000],
    [4,   256,  0, 15.6,  85000],
    [4,   512,  0, 15.6,  95000],
    [8,   256,  0, 15.6, 115000],
    [8,   256,  0, 14.0, 110000],
    [8,   512,  0, 15.6, 135000],  # Dell Inspiron, HP 15s, Acer Aspire
    [8,   512,  0, 14.0, 130000],
    [8,  1000,  0, 15.6, 148000],
    [16,  256,  0, 15.6, 148000],
    [16,  512,  0, 15.6, 162000],  # ASUS VivoBook, Lenovo IdeaPad
    [16,  512,  0, 14.0, 158000],
    [16, 1000,  0, 15.6, 185000],  # MSI Modern 14
    [32,  512,  0, 15.6, 215000],
    [32, 1000,  0, 15.6, 245000],
    [64, 1000,  0, 15.6, 310000],
    [8,   512,  0, 17.3, 155000],  # 17-inch budget
    [16,  512,  0, 17.3, 178000],
    # Premium — Apple MacBook, Dell XPS, Lenovo ThinkPad X1
    [8,   256,  1, 13.6, 280000],  # MacBook Air M2 base
    [8,   512,  1, 13.6, 345000],  # MacBook Air M2 upgraded
    [16,  256,  1, 14.0, 350000],
    [16,  512,  1, 14.0, 390000],  # MacBook Air M2 16GB
    [16,  512,  1, 15.6, 415000],  # Dell XPS 15
    [16, 1000,  1, 15.6, 445000],  # Dell XPS 15 top
    [24,  512,  1, 14.2, 425000],  # MacBook Pro M3 base
    [24, 1000,  1, 14.2, 495000],  # MacBook Pro M3
    [32, 1000,  1, 14.2, 575000],  # MacBook Pro M3 Pro
    [32, 2000,  1, 16.2, 660000],  # MacBook Pro M3 Max
    [36, 1000,  1, 16.0, 685000],
    [64, 1000,  1, 16.0, 860000],
    [16,  512,  1, 13.0, 370000],  # ThinkPad X1 Carbon
    [32,  512,  1, 13.0, 480000],
]

# ── MOBILES: [ram_gb, storage_gb, is_premium, camera_mp, price] ──
MOBILE_DATA = [
    # Budget — QMobile, Tecno, Realme, Xiaomi Redmi
    [1,   16,  0,  8,  12000],
    [2,   32,  0, 13,  18000],
    [3,   64,  0, 13,  22000],
    [4,   32,  0, 13,  20000],  # very budget 4GB
    [4,   64,  0, 13,  24000],  # budget 4GB 64GB
    [4,   64,  0, 48,  26000],  # QMobile Phantom
    [4,  128,  0, 48,  30000],  # Realme C series
    [4,  128,  0, 50,  32000],  # Tecno Spark
    [6,  128,  0, 50,  35000],  # Realme C67
    [6,  128,  0,108,  38000],
    [6,  256,  0,108,  48000],
    [8,  128,  0, 50,  52000],
    [8,  256,  0,200,  65000],  # Xiaomi Redmi Note 13 Pro
    [8,  256,  0, 50,  72000],  # Samsung Galaxy A35
    [8,  256,  0, 50,  89000],  # Samsung Galaxy A55
    [8,  512,  0, 50,  95000],
    [12, 256,  0, 50,  98000],
    [12, 512,  0,108, 108000],
    # Premium — Apple iPhone, Samsung S/Z series
    [6,  128,  1, 12, 190000],  # iPhone 14 base
    [6,  256,  1, 12, 220000],  # iPhone 14 256GB
    [6,  128,  1, 48, 310000],  # iPhone 15
    [6,  256,  1, 48, 342000],  # iPhone 15 256GB
    [6,  512,  1, 48, 400000],  # iPhone 15 512GB
    [8,  128,  1, 48, 330000],  # iPhone 15 Plus
    [8,  256,  1, 48, 360000],
    [8,  256,  1, 50, 199000],  # Samsung Galaxy S24
    [8,  256,  1, 50, 260000],  # Samsung S23+
    [12, 256,  1, 50, 380000],  # Samsung S24 Ultra
    [12, 512,  1,200, 450000],  # Samsung S24 Ultra 512GB
    [8,  256,  1, 48, 420000],  # iPhone 15 Pro
    [8,  512,  1, 48, 480000],  # iPhone 15 Pro 512GB
    [8, 1000,  1, 48, 545000],  # iPhone 15 Pro Max 1TB
    [16, 512,  1,200, 520000],  # Samsung S24 Ultra top
]

# ── MONITORS: [screen_size, is_gaming(144hz+), is_curved, is_premium, is_4k, price] ─
MONITOR_DATA = [
    # Budget / office monitors
    [22, 0, 0, 0, 0,  22000],  # Haier 22" budget
    [24, 0, 0, 0, 0,  28000],  # generic 24" FHD
    [24, 0, 0, 0, 0,  32000],  # Dell D2421H
    [24, 0, 0, 1, 0,  45000],  # Dell premium 24"
    [27, 0, 0, 0, 0,  42000],  # generic 27" FHD
    [27, 0, 0, 1, 0,  65000],  # Dell 27" premium
    [32, 0, 0, 0, 0,  58000],  # generic 32" FHD
    [32, 0, 1, 0, 0,  68000],  # Samsung 32" curved (non-gaming)
    [32, 0, 0, 1, 0,  85000],  # premium 32"
    # Gaming monitors (144Hz+)
    [24, 1, 0, 0, 0,  38000],  # 24" 144Hz gaming
    [24, 1, 0, 0, 0,  45000],  # 24" 165Hz gaming
    [27, 1, 0, 0, 0,  52000],  # AOC 27" 165Hz
    [27, 1, 0, 0, 0,  62000],  # 27" 165Hz IPS
    [27, 1, 1, 0, 0,  72000],  # 27" curved gaming
    [32, 1, 0, 0, 0,  85000],  # 32" 144Hz
    [32, 1, 1, 0, 0,  95000],  # 32" curved gaming
    # QHD monitors
    [27, 1, 0, 1, 0,  85000],  # 27" QHD 144Hz premium
    [27, 1, 0, 1, 0, 105000],  # 27" QHD 165Hz premium
    [32, 1, 1, 1, 0, 125000],  # 32" QHD curved premium
    # 4K monitors
    [27, 0, 0, 0, 1,  95000],  # 27" 4K 60Hz
    [27, 1, 0, 1, 1, 160000],  # 27" 4K 144Hz premium
    [32, 0, 0, 1, 1, 130000],  # 32" 4K
    [32, 1, 0, 1, 1, 190000],  # 32" 4K 144Hz
    [49, 1, 1, 1, 0, 250000],  # 49" ultrawide
]

# ── COMPONENTS: [type_id, tier, spec_value, price] ──
# type_id: 0=CPU, 1=GPU, 2=RAM, 3=Motherboard, 4=Cooler, 5=PSU, 6=Case
# tier: 0=budget, 1=mid, 2=high, 3=flagship
# spec_value: for CPU=cores, for GPU=vram_gb, for RAM=capacity_gb
COMPONENT_DATA = [
    # CPUs (type=0)
    [0, 0,  4,   8000],  # Pentium/Athlon budget
    [0, 0,  4,  12000],  # Core i3 / Ryzen 3 3100
    [0, 1,  6,  18000],  # Core i5-10400 / Ryzen 5 3600
    [0, 1,  6,  25000],  # AMD Ryzen 5 5600X — our product
    [0, 1,  6,  28000],  # Intel Core i5-12400F — our product
    [0, 1,  8,  35000],  # Ryzen 7 5700X
    [0, 2,  8,  45000],  # Core i7-12700F
    [0, 2, 12,  58000],  # Ryzen 9 5900X
    [0, 3, 16,  85000],  # Core i9-13900K
    [0, 3, 16, 120000],  # Ryzen Threadripper
    # GPUs (type=1)
    [1, 0,  4,  28000],  # GTX 1650
    [1, 0,  6,  42000],  # RTX 3050
    [1, 1,  8,  65000],  # RTX 3060
    [1, 1,  8,  95000],  # RTX 4060 — our product
    [1, 1, 12, 115000],  # RTX 4060 Ti
    [1, 2, 12, 155000],  # RTX 4070
    [1, 2, 16, 195000],  # RTX 4070 Ti
    [1, 3, 16, 265000],  # RTX 4080
    [1, 3, 24, 420000],  # RTX 4090
    [1, 0,  8,  52000],  # RX 6600
    [1, 1,  8,  82000],  # RX 7600
    [1, 2, 16, 145000],  # RX 7700 XT
    # RAM (type=2)
    [2, 0,  8,   4500],  # 8GB DDR4
    [2, 0, 16,   8500],  # Corsair 16GB DDR4 — our product
    [2, 0, 32,  15000],  # 32GB DDR4
    [2, 1, 16,  12000],  # 16GB DDR5
    [2, 1, 32,  22000],  # 32GB DDR5
    [2, 2, 32,  24000],  # 32GB DDR5 premium
    [2, 2, 64,  38000],  # 64GB DDR5
    [2, 3, 64,  55000],  # 64GB DDR5 flagship
    # Motherboards (type=3)
    [3, 0,  0,  10000],  # H510 / A320 budget
    [3, 0,  0,  14000],  # B450 budget
    [3, 1,  0,  22000],  # B550 mid
    [3, 1,  0,  26000],  # B660 mid Intel
    [3, 2,  0,  38000],  # X570 high-end
    [3, 2,  0,  45000],  # Z690 high-end Intel
    [3, 3,  0,  72000],  # X670E flagship
    [3, 3,  0,  85000],  # Z790 flagship Intel
    # Coolers (type=4)
    [4, 0,  0,   3000],  # air budget stock
    [4, 0,  0,   4500],  # air budget aftermarket
    [4, 1,  0,   8000],  # air mid (Noctua U12S budget)
    [4, 1,  0,  12000],  # 240mm AIO budget
    [4, 2,  0,  18000],  # 240mm AIO mid
    [4, 2,  0,  25000],  # 360mm AIO budget
    [4, 3,  0,  32000],  # 360mm AIO premium
    # PSUs (type=5)
    [5, 0,  0,   6000],  # 500W bronze
    [5, 1,  0,  12000],  # 650W gold
    [5, 2,  0,  18000],  # 750W gold modular
    [5, 3,  0,  28000],  # 1000W platinum
    # Cases (type=6)
    [6, 0,  0,   5000],  # basic ATX
    [6, 1,  0,  10000],  # mid-tower with fans
    [6, 2,  0,  18000],  # tempered glass premium
    [6, 3,  0,  32000],  # full tower premium
]

# ── STORAGE: [capacity_gb, is_ssd(1) or hdd(0), is_nvme, price] ─
STORAGE_DATA = [
    # HDDs (is_ssd=0, is_nvme=0)
    [ 500, 0, 0,  3500],
    [1000, 0, 0,  6000],
    [1000, 0, 0,  7500],  # Seagate 1TB — our product
    [2000, 0, 0, 11000],
    [4000, 0, 0, 18000],
    # External HDDs
    [ 500, 0, 0,  4500],
    [1000, 0, 0,  7500],
    [2000, 0, 0, 13000],
    # SATA SSDs (is_ssd=1, is_nvme=0)
    [ 128, 1, 0,  4000],
    [ 256, 1, 0,  5500],
    [ 512, 1, 0,  8500],
    [1000, 1, 0, 14000],
    [2000, 1, 0, 26000],
    # NVMe SSDs (is_ssd=1, is_nvme=1)
    [ 256, 1, 1,  6000],
    [ 512, 1, 1,  9500],
    [1000, 1, 1, 18000],  # WD Blue SN580 — our product
    [1000, 1, 1, 20000],  # Samsung 980 Pro
    [2000, 1, 1, 35000],
    [4000, 1, 1, 65000],
    # USB Flash drives
    [  32, 1, 0,   800],
    [  64, 1, 0,  1200],
    [ 128, 1, 0,  2000],
    [ 256, 1, 0,  3200],  # SanDisk 256GB — our product
    [ 512, 1, 0,  5500],
]

# ── ACCESSORIES: [type_id, tier, price] ─
# type_id: 0=keyboard/mouse, 1=speaker/headset, 2=UPS, 3=charger, 4=webcam, 5=mousepad, 6=hub
ACCESSORY_DATA = [
    [0, 0,  1500],  # basic wired KB+mouse
    [0, 0,  2500],  # decent wired combo
    [0, 1,  4500],  # Logitech MK235 wireless — our product
    [0, 1,  6500],  # Logitech MK545
    [0, 2, 12000],  # mechanical keyboard
    [0, 2, 18000],  # gaming mechanical
    [0, 3, 28000],  # premium wireless gaming
    [1, 0,  2000],  # budget speaker
    [1, 0,  3500],  # Audionic speaker — our product
    [1, 1,  7000],  # mid speaker system
    [1, 1,  5000],  # gaming headset budget
    [1, 2, 12000],  # JBL speaker
    [1, 2, 18000],  # premium headset
    [1, 3, 35000],  # Sony WH-1000XM5
    [2, 0,  8000],  # 600VA UPS
    [2, 1, 12000],  # 1000VA UPS
    [2, 1, 18000],  # Microtek 1200VA — our product
    [2, 2, 28000],  # 2000VA UPS
    [2, 3, 45000],  # 3000VA online UPS
    [3, 0,  1500],  # basic charger
    [3, 1,  3800],  # Anker 65W GaN — our product
    [3, 1,  5500],  # 100W charger
    [3, 2,  8500],  # 140W MacBook charger
    [4, 0,  3500],  # budget webcam
    [4, 1,  8000],  # 1080p webcam
    [4, 2, 18000],  # 4K webcam
    [5, 0,   500],  # basic mousepad
    [5, 1,  1500],  # XL mousepad
    [5, 2,  4500],  # RGB mousepad
    [6, 0,  1200],  # USB hub basic
    [6, 1,  3500],  # USB-C hub
    [6, 2,  8000],  # Thunderbolt dock
]

# ── NETWORKING: [speed_mbps, is_wifi6, num_ports, price] ─
NETWORKING_DATA = [
    [ 300, 0, 4,   1800],  # TP-Link USB WiFi adapter — our product
    [ 300, 0, 4,   2500],  # N300 router
    [ 750, 0, 4,   3500],  # AC750 router
    [1200, 0, 4,   5500],  # AC1200 router
    [1200, 0, 4,   7000],  # AC1200 premium
    [1800, 0, 4,   9000],  # AC1800
    [3000, 1, 4,  12500],  # TP-Link AX3000 WiFi 6 — our product
    [3000, 1, 4,  15000],  # AX3000 premium
    [6000, 1, 4,  22000],  # AX6000
    [6000, 1, 8,  35000],  # AX6000 pro
    [9000, 1, 8,  55000],  # AX9000 flagship
    [1000, 0, 8,  12000],  # 8-port gigabit switch
    [1000, 0,16,  22000],  # 16-port switch
    [ 300, 0, 1,   4500],  # WiFi range extender
    [1200, 1, 1,   8000],  # WiFi 6 extender
]

# ═══════════════════════════════════════════════════════════════════
#  INTENT RESPONSES (chatbot non-price answers)
# ═══════════════════════════════════════════════════════════════════
INTENTS = {
    "greeting": {
        "keywords": ["hello","hi","hey","assalam","salam","aoa","good morning",
                     "good evening","kya hal","kaise ho","sup","how are you"],
        "response": (
            "Assalam-o-Alaikum! 👋 Welcome to Master Computers.\n\n"
            "I can help you predict prices for:\n"
            "• 💻 Laptops & MacBooks\n• 📱 Mobile phones\n• 🖥 Monitors\n"
            "• ⚙️ CPUs, GPUs, RAM\n• 💾 SSDs & HDDs\n• 🖱️ Accessories\n• 📡 Routers\n\n"
            "Ask me anything like:\n"
            "• 'RTX 4060 price?'\n• '16GB DDR5 RAM kitna hoga?'\n"
            "• 'Budget gaming PC 50000?'\n• 'iPhone 15 Pro price?'"
        )
    },
    "delivery": {
        "keywords": ["deliver","delivery","shipping","courier","dispatch","karachi",
                     "lahore","islamabad","peshawar","quetta","multan","faisalabad",
                     "rawalpindi","sialkot","hyderabad","how long","kitne din","days",
                     "tracking","city","cities","nationwide"],
        "response": (
            "🚚 **Delivery across Pakistan:**\n\n"
            "• Karachi, Lahore, Islamabad → 1–2 business days\n"
            "• Peshawar, Quetta, Multan, Faisalabad → 2–4 days\n"
            "• Other cities → 3–6 business days\n\n"
            "**Free delivery** on orders above Rs. 50,000!\n"
            "Below Rs. 50,000 → flat Rs. 500 shipping fee."
        )
    },
    "payment": {
        "keywords": ["payment","pay","easypaisa","jazzcash","bank","transfer","cod",
                     "cash on delivery","cash","online","card","debit","credit",
                     "meezan","sadapay","nayapay","wallet","how to pay","kaisay pay"],
        "response": (
            "💳 **Payment Methods:**\n\n"
            "1. **Cash on Delivery (COD)** ✅ Most popular\n"
            "2. **Easypaisa** — mobile wallet\n"
            "3. **JazzCash** — mobile wallet\n"
            "4. **Bank Transfer** — HBL, UBL, Meezan\n\n"
            "COD recommended — no advance payment needed!"
        )
    },
    "warranty": {
        "keywords": ["warranty","guarantee","waranti","faulty","broken","repair",
                     "service","claim","after sale","support","official","genuine"],
        "response": (
            "🛡️ **Official Pakistani Warranty:**\n\n"
            "• Laptops: 1–2 years\n• Phones: 1 year\n"
            "• Monitors: 2–3 years\n• CPU/GPU: 3 years\n"
            "• RAM/SSD: 3–5 years (some lifetime)\n"
            "• Accessories: 1–2 years\n\n"
            "All claims through official brand service centers in Pakistan."
        )
    },
    "returns": {
        "keywords": ["return","refund","exchange","replace","wrong item","damaged",
                     "not working","defective","cancel","wapas","7 day","policy"],
        "response": (
            "🔄 **7-Day Return Policy:**\n\n"
            "• Item unused and in original packaging\n"
            "• All accessories and box included\n"
            "• Receipt or order confirmation required\n\n"
            "Defective items → replaced immediately!\n"
            "Call 0300-1234567 to arrange."
        )
    },
    "gaming": {
        "keywords": ["gaming","game","pubg","valorant","fortnite","gta","cod","fps",
                     "gaming laptop","gaming pc","gaming phone","rtx","gtx","esports",
                     "144hz","165hz","gaming setup","streamer","high fps"],
        "response": (
            "🎮 **Gaming Recommendations (Pakistan 2024-25):**\n\n"
            "**Budget Gaming PC (Rs. 80k–120k):**\n"
            "Ryzen 5 5600X + RTX 4060 + 16GB RAM\n"
            "→ 1080p ultra on all games\n\n"
            "**Gaming Laptop (Rs. 150k–200k):**\n"
            "ASUS VivoBook 15 (144Hz) or MSI Modern\n\n"
            "**Gaming Monitor:** AOC 27\" 165Hz → Rs. 52,000\n\n"
            "Want a price prediction? Ask: 'RTX 4060 price?' or '16GB gaming laptop?'"
        )
    },
    "student": {
        "keywords": ["student","study","university","college","school","assignment",
                     "thesis","coding","programming","degree","parhai","for studies",
                     "office work","ms office","zoom","online class"],
        "response": (
            "🎓 **Best Student Laptops (Pakistan):**\n\n"
            "**Under Rs. 130k:** Acer Aspire 5 / HP 15s\n"
            "**Rs. 130k–160k:** Dell Inspiron / Lenovo IdeaPad\n"
            "**Rs. 160k+:** ASUS VivoBook / MSI Modern\n\n"
            "All include Windows 11, 6–8hr battery, official warranty.\n"
            "CS students: get 16GB RAM minimum!"
        )
    },
    "apple": {
        "keywords": ["apple","macbook","mac","iphone","ipad","ios","macos",
                     "m1","m2","m3","retina","icare"],
        "response": (
            "🍎 **Apple Products in Pakistan:**\n\n"
            "**MacBook Air M2:** Rs. 385,000 (8GB) | Rs. 440,000 (16GB)\n"
            "**iPhone 15:** Rs. 329,000 (128GB)\n"
            "**iPhone 15 Pro:** Rs. 420,000\n\n"
            "Available at iCare, iFix stores — or our shop!\n"
            "1-year international warranty."
        )
    },
    "contact": {
        "keywords": ["contact","phone","number","call","whatsapp","email","address",
                     "location","store","shop","visit","helpline","support","help"],
        "response": (
            "📞 **Contact Master Computers:**\n\n"
            "📱 Phone/WhatsApp: 0300-1234567\n"
            "📧 Email: info@mastercomputers.pk\n"
            "📍 Lahore: Hafeez Center | Karachi: Saddar\n"
            "🕐 Mon–Sat: 10AM–8PM | Sun: 12PM–6PM"
        )
    },
    "budget": {
        "keywords": ["budget","cheap","affordable","sasta","kam daam","low price",
                     "under","50k","100k","150k","200k","best under","cheapest",
                     "value for money","economy"],
        "response": (
            "💰 **Pakistani Market Price Guide 2024-25:**\n\n"
            "Under Rs. 5,000 → USB drives, accessories\n"
            "Rs. 5k–30k → Budget phones, RAM, storage\n"
            "Rs. 30k–65k → Mid phones, monitors\n"
            "Rs. 65k–130k → Good phones, budget laptops\n"
            "Rs. 130k–200k → Good laptops, GPUs\n"
            "Rs. 200k–400k → Premium phones, pro laptops\n"
            "Rs. 400k+ → MacBook, iPhone Pro, Dell XPS\n\n"
            "Tell me your budget and use case for a recommendation!"
        )
    },
    "farewell": {
        "keywords": ["thank","thanks","shukriya","shukria","thank you","goodbye",
                     "bye","khuda hafiz","ok done","got it","understood","clear"],
        "response": "Shukriya! 🙏 Happy shopping at Master Computers! 🇵🇰"
    },
}


# ═══════════════════════════════════════════════════════════════════
#  DEVICE / CATEGORY DETECTION KEYWORDS
# ═══════════════════════════════════════════════════════════════════

DEVICE_KEYWORDS = {
    "laptop": [
        "laptop","notebook","macbook","ultrabook","chromebook","lapi","lappu",
        "gaming laptop","student laptop","office laptop","business laptop",
        "lenovo","ideapad","thinkpad","inspiron","xps","vivobook","zenbook",
        "aspire","swift","pavilion","envy","spectre","matebook","surface laptop",
        "msi laptop","acer laptop","dell laptop","hp laptop","asus laptop"
    ],
    "mobile": [
        "phone","mobile","smartphone","handset","cell","fone","phon",
        "iphone","galaxy","samsung galaxy","samsung s","s24","s23","s22","redmi",
        "realme","qmobile","tecno","vivo","oppo","oneplus","pixel","note",
        "android","ios","5g phone","4g phone","samsung a","samsung m"
    ],
    "monitor": [
        "monitor","display","screen","lcd","led monitor","gaming monitor",
        "curved monitor","4k monitor","ultrawide","144hz","165hz","240hz",
        "ips monitor","va panel","office monitor","dual monitor"
    ],
    "gpu": [
        "gpu","graphics card","graphics","rtx","gtx","rx","radeon","geforce",
        "nvidia","vga","video card","rtx 4060","rtx 4070","rtx 4080","rtx 4090",
        "rtx 3060","rtx 3070","rx 6600","rx 7600","rx 7700"
    ],
    "cpu": [
        "cpu","processor","ryzen","core i","intel","amd","i3","i5","i7","i9",
        "threadripper","xeon","pentium","celeron","athlon",
        "12400","12700","13900","5600","5700","5900","7600","7700"
    ],
    "ram": [
        "ram","memory","ddr4","ddr5","dimm","sodimm","corsair vengeance",
        "kingston fury","g.skill","hyperx","crucial ballistix",
        "8gb ram","16gb ram","32gb ram","64gb ram"
    ],
    "ssd": [
        "ssd","nvme","m.2","solid state","pcie ssd","sata ssd",
        "samsung 980","wd blue","crucial mx","kingston a2000",
        "512gb ssd","1tb ssd","2tb ssd","hard drive ssd"
    ],
    "hdd": [
        "hdd","hard drive","hard disk","external hdd","portable drive",
        "seagate","western digital external","toshiba hdd","backup drive",
        "1tb hdd","2tb hdd","external hard","portable hard"
    ],
    "storage": [
        "storage","usb drive","flash drive","pen drive","pendrive","thumb drive",
        "usb flash","flash stick","usb stick","memory card","microsd",
        "sandisk","kingston flash","pen drive"
    ],
    "router": [
        "router","wifi router","wireless router","modem router","mesh wifi",
        "tp-link","d-link","tenda","asus router","netgear","ubiquiti",
        "ax3000","ax6000","ac1200","wi-fi","wifi 6","access point"
    ],
    "keyboard": [
        "keyboard","mechanical keyboard","gaming keyboard","wireless keyboard",
        "logitech","razer keyboard","corsair keyboard","hyperx keyboard"
    ],
    "mouse": [
        "mouse","gaming mouse","wireless mouse","optical mouse","logitech mouse"
    ],
    "ups": [
        "ups","uninterruptible","power supply unit","inverter",
        "microtek","apc ups","cyber power","1200va","2000va","600va"
    ],
    "speaker": [
        "speaker","bluetooth speaker","soundbar","audionic","jbl","marshall",
        "harman","portable speaker","wireless speaker","logitech speaker",
        "bose speaker","soundbar","audio speaker","music speaker"
    ],
    "headset": [
        "headset","headphones","earphones","earbuds","airpods","noise cancel",
        "sony wh","jabra","bose","sennheiser","hyperx headset"
    ],
    "charger": [
        "charger","power adapter","gan charger","fast charger","65w","100w",
        "140w","anker","baseus","usb-c charger","laptop charger"
    ],
    "motherboard": [
        "motherboard","mobo","b450","b550","b660","x570","x670","z690","z790",
        "gigabyte","msi board","asus board","asrock","intel board","amd board"
    ],
    "cooler": [
        "cooler","cpu cooler","air cooler","aio","liquid cooling","360mm",
        "240mm","noctua","deepcool","be quiet","cooler master","dark rock"
    ],
    "psu": [
        "psu","power supply","550w","650w","750w","850w","1000w",
        "80 plus","bronze","gold","platinum","seasonic","corsair psu","evga"
    ],
    "case": [
        "case","cabinet","chassis","tower","mid tower","full tower",
        "pc case","tempered glass","nzxt","fractal","lian li","phanteks"
    ],
}

# ── COMPONENT TYPE MAP (for component model) ─
COMP_TYPE_IDS = {
    "cpu": 0, "gpu": 1, "ram": 2, "motherboard": 3,
    "cooler": 4, "psu": 5, "case": 6
}

# ── GPU VRAM LOOKUP ──────────────────────────────────────────────
GPU_VRAM = {
    "1650":4,"1660":6,"1660 super":6,"3050":8,"3060":12,"3060 ti":8,
    "3070":8,"3080":10,"3090":24,"3090 ti":24,
    "4060":8,"4060 ti":8,"4070":12,"4070 super":12,"4070 ti":12,
    "4080":16,"4090":24,
    "6600":8,"6650 xt":8,"6700 xt":12,"6800 xt":16,"6900 xt":16,
    "7600":8,"7700 xt":12,"7800 xt":16,"7900 xt":20,"7900 xtx":24,
}

# ── CPU CORES LOOKUP ─────────────────────────────────────────────
CPU_CORES = {
    "i3":4,"i5":6,"i7":8,"i9":16,"pentium":2,"celeron":2,"athlon":4,
    "ryzen 3":4,"ryzen 5":6,"ryzen 7":8,"ryzen 9":12,"threadripper":32,
    "12400":6,"12700":8,"13600":14,"13900":24,
    "5600":6,"5700":8,"5900":12,"7600":6,"7700":8,"7900":12,
}


# ═══════════════════════════════════════════════════════════════════
#  K-MEANS RECOMMENDATION ENGINE
# ═══════════════════════════════════════════════════════════════════
class RecommendationEngine:
    def __init__(self):
        self.model     = None
        self.scaler    = StandardScaler()
        self.df        = None
        self.label_enc = LabelEncoder()
        self._train()

    def _train(self):
        cols     = ['id','name','category','brand','price','ram','storage','is_mobile']
        self.df  = pd.DataFrame(PRODUCTS_DATA, columns=cols)
        self.df['category_enc'] = self.label_enc.fit_transform(self.df['category'])
        features_scaled = self.scaler.fit_transform(
            self.df[['price','category_enc','ram','storage']].values
        )
        self.model = KMeans(n_clusters=5, random_state=42, n_init=10)
        self.df['cluster'] = self.model.fit_predict(features_scaled)
        print(f"[ML] K-Means trained → 5 clusters, {len(self.df)} products")
        for c in range(5):
            names = self.df[self.df['cluster']==c]['name'].tolist()
            avg   = self.df[self.df['cluster']==c]['price'].mean()
            print(f"     Cluster {c} (avg Rs.{avg:,.0f}): {names}")

    def recommend(self, product_id, top_n=4):
        row = self.df[self.df['id']==product_id]
        if row.empty:
            return self.df.head(top_n)[['id','name','category','brand','price']].to_dict(orient='records')
        cluster      = int(row['cluster'].values[0])
        target_price = float(row['price'].values[0])
        same         = self.df[(self.df['cluster']==cluster)&(self.df['id']!=product_id)].copy()
        if same.empty:
            same = self.df[self.df['id']!=product_id].copy()
        same['pdiff'] = abs(same['price'] - target_price)
        return same.sort_values('pdiff').head(top_n)[['id','name','category','brand','price']].to_dict(orient='records')

    def get_cluster_info(self):
        info = []
        for c in range(5):
            d = self.df[self.df['cluster']==c]
            info.append({
                'cluster':    c,
                'count':      int(len(d)),
                'avg_price':  round(float(d['price'].mean()),0),
                'categories': d['category'].unique().tolist(),
                'brands':     d['brand'].unique().tolist()[:5],
            })
        return info


# ═══════════════════════════════════════════════════════════════════
#  MULTI-CATEGORY PRICE PREDICTION BOT
#  Separate Linear Regression model per category for high accuracy
# ═══════════════════════════════════════════════════════════════════
class PricePredictionBot:
    def __init__(self):
        self.models  = {}   # category → {model, scaler}
        self._train_all()

    def _fit(self, name, data):
        arr = np.array(data, dtype=float)
        X = arr[:,:-1]; y = arr[:,-1]
        sc = StandardScaler()
        Xs = sc.fit_transform(X)
        lr = LinearRegression().fit(Xs, y)
        r2  = r2_score(y, lr.predict(Xs))
        mae = mean_absolute_error(y, lr.predict(Xs))
        self.models[name] = {'model': lr, 'scaler': sc}
        print(f"     {name:<14} → R²={r2:.3f}  MAE=Rs.{mae:,.0f}  n={len(y)}")

    def _train_all(self):
        print("[ML] Training per-category Linear Regression models:")
        self._fit('laptop',      LAPTOP_DATA)
        self._fit('mobile',      MOBILE_DATA)
        self._fit('monitor',     MONITOR_DATA)
        self._fit('component',   COMPONENT_DATA)
        self._fit('storage',     STORAGE_DATA)
        self._fit('accessory',   ACCESSORY_DATA)
        self._fit('networking',  NETWORKING_DATA)
        print(f"[ML] All 7 price models ready.")

    def _predict(self, category, features):
        m    = self.models[category]
        X    = np.array([features], dtype=float)
        Xs   = m['scaler'].transform(X)
        p    = float(m['model'].predict(Xs)[0])
        p    = max(1000, p)
        pr   = round(p / 500) * 500
        return pr

    # ── FEATURE EXTRACTORS ────────────────────────────────────────

    def _detect_category(self, msg):
        """Return detected device category string."""
        for cat, keywords in DEVICE_KEYWORDS.items():
            if any(kw in msg for kw in keywords):
                return cat
        return None

    def _extract_ram(self, msg):
        m = re.search(r'(\d+)\s*gb\s*(ram|memory|mem)\b', msg)
        if m: return int(m.group(1))
        m = re.search(r'\b(2|3|4|6|8|10|12|16|18|24|32|36|48|64)\s*gb\b', msg)
        if m:
            v = int(m.group(1))
            if v in (2,3,4,6,8,10,12,16,18,24,32,36,48,64):
                return v
        return 8

    def _extract_storage(self, msg):
        m = re.search(r'(\d+)\s*tb\b', msg)
        if m: return int(m.group(1)) * 1000
        m = re.search(r'(\d+)\s*gb\s*(ssd|hdd|storage|disk|nvme|internal|capacity)\b', msg)
        if m: return int(m.group(1))
        for v in [16,32,64,128,256,512,1000,2000,4000]:
            if re.search(rf'\b{v}\s*gb\b', msg):
                return v
        return 512

    def _extract_screen(self, msg):
        m = re.search(r'(\d+\.?\d*)\s*(?:inch|")\b', msg)
        return float(m.group(1)) if m else 15.6

    def _is_premium(self, msg):
        premium = ['apple','iphone','macbook','mac pro','xps','dell xps','flagship',
                   'pro max','zenfone','galaxy s','s24','s23','thinkpad x1',
                   'latitude','zenbook pro','surface pro','iphone pro','spectre',
                   'matebook x pro','swift x']
        return any(w in msg for w in premium)

    def _is_gaming(self, msg):
        return any(w in msg for w in ['gaming','144hz','165hz','240hz','game'])

    def _is_curved(self, msg):
        return 'curved' in msg or 'ultrawide' in msg

    def _is_4k(self, msg):
        return '4k' in msg or 'uhd' in msg or '3840' in msg

    def _detect_comp_type(self, msg):
        for cat in ['gpu','cpu','ram','motherboard','cooler','psu','case']:
            if any(kw in msg for kw in DEVICE_KEYWORDS.get(cat,[])):
                return cat
        return None

    def _detect_tier(self, msg):
        """0=budget, 1=mid, 2=high, 3=flagship"""
        if any(w in msg for w in ['budget','cheap','sasta','entry','basic','low end','bronze']):
            return 0
        if any(w in msg for w in ['mid','middle','average','standard','gold','silver']):
            return 1
        if any(w in msg for w in ['high end','high-end','upper','good','best','platinum']):
            return 2
        if any(w in msg for w in ['flagship','top','premium','ultimate','extreme','titanium']):
            return 3
        # GPU-specific tier detection
        flagship_gpu = ['4090','3090','7900 xtx','4080']
        high_gpu     = ['4070','3080','7900 xt','7800 xt','6900 xt']
        mid_gpu      = ['4060','4060 ti','3060','6700 xt','6800 xt','7600','7700']
        if any(g in msg for g in flagship_gpu): return 3
        if any(g in msg for g in high_gpu):     return 2
        if any(g in msg for g in mid_gpu):      return 1
        return 1  # default mid

    def _storage_type(self, msg):
        """Returns (is_ssd, is_nvme)"""
        if any(w in msg for w in ['nvme','m.2','pcie ssd','pcie']):
            return 1, 1
        if any(w in msg for w in ['ssd','solid state','sata ssd']):
            return 1, 0
        if any(w in msg for w in ['hdd','hard drive','hard disk','external']):
            return 0, 0
        if any(w in msg for w in ['usb','flash','pen drive','pendrive','thumb']):
            return 1, 0
        # capacity hints
        if self._extract_storage(msg) <= 512:
            return 1, 0   # small = likely USB/SSD
        return 0, 0       # default HDD

    def predict(self, user_message):
        """
        Main prediction entry point.
        Returns dict with: predicted_price, price_range_low,
                           price_range_high, currency, message, parsed
        """
        msg = user_message.lower().strip()
        cat = self._detect_category(msg)

        # ─── LAPTOP ─────────────────────────────────────────────
        if cat == 'laptop':
            ram     = self._extract_ram(msg)
            storage = self._extract_storage(msg)
            premium = self._is_premium(msg)
            screen  = self._extract_screen(msg)
            price   = self._predict('laptop', [ram, storage, int(premium), screen])
            device  = f"{'premium ' if premium else ''}laptop"
            specs   = f"{ram}GB RAM, {storage}GB storage"
            return self._wrap(price, device, specs, premium)

        # ─── MOBILE ─────────────────────────────────────────────
        elif cat == 'mobile':
            ram     = self._extract_ram(msg)
            storage = self._extract_storage(msg)
            premium = self._is_premium(msg)
            # estimate camera MP from context
            cam_mp  = 48
            if any(w in msg for w in ['200mp','200 mp']): cam_mp = 200
            elif any(w in msg for w in ['108mp','108 mp']): cam_mp = 108
            elif any(w in msg for w in ['50mp','50 mp']):   cam_mp = 50
            elif premium: cam_mp = 48
            # Direct price lookup for known phone models
            PHONE_PRICES = {
                'iphone 15 pro max':545000,'iphone 15 pro':420000,
                'iphone 15 plus':340000,'iphone 15':329000,
                'iphone 14 pro max':480000,'iphone 14 pro':420000,
                'iphone 14':290000,'iphone 13':240000,
                's24 ultra':380000,'s24+':280000,'galaxy s24':199000,
                's23 ultra':350000,'galaxy s23':185000,
                'redmi note 13 pro':65000,'redmi note 13':52000,
                'galaxy a55':89000,'galaxy a35':72000,'galaxy a15':38000,
                'realme c67':35000,'realme c55':30000,
                'tecno spark 20 pro':32000,'tecno pop 8':22000,
            }
            found_price = None
            for model_name, p in PHONE_PRICES.items():
                if model_name in msg:
                    found_price = p; break
            if found_price:
                return self._wrap(found_price, f"{'premium ' if premium else ''}mobile phone",
                                  f"{ram}GB RAM, {storage}GB storage", premium)
            price  = max(self._predict('mobile', [ram, storage, int(premium), cam_mp]), 18000)
            device = f"{'premium ' if premium else ''}mobile phone"
            specs  = f"{ram}GB RAM, {storage}GB storage"
            return self._wrap(price, device, specs, premium)

        # ─── MONITOR ────────────────────────────────────────────
        elif cat == 'monitor':
            screen  = self._extract_screen(msg)
            if screen == 15.6: screen = 27.0
            gaming  = self._is_gaming(msg)
            curved  = self._is_curved(msg)
            premium = self._is_premium(msg)
            is_4k   = self._is_4k(msg)
            price   = self._predict('monitor', [screen, int(gaming), int(curved), int(premium), int(is_4k)])
            device  = f"{int(screen)}\" {'gaming ' if gaming else ''}monitor"
            specs   = f"{int(screen)} inch, {'4K' if is_4k else '1080p/1440p'}, {'144Hz+' if gaming else '60Hz'}"
            return self._wrap(price, device, specs, premium)

        # ─── GPU ────────────────────────────────────────────────
        elif cat == 'gpu':
            # Direct price lookup for known GPU models (Pakistani market 2024-25)
            GPU_PRICES_PKR = {
                '1650':28000,'1660':42000,'1660 super':48000,
                '3050':45000,'3060':65000,'3060 ti':78000,'3070':95000,
                '3080':148000,'3090':220000,
                '4060':95000,'4060 ti':118000,'4070':158000,
                '4070 super':178000,'4070 ti':205000,'4080':265000,'4090':420000,
                '6600':42000,'6650 xt':52000,'6700 xt':82000,
                '6800 xt':148000,'6900 xt':185000,
                '7600':52000,'7700 xt':92000,'7800 xt':145000,
                '7900 xt':198000,'7900 xtx':240000,
            }
            found_price = None
            found_name  = "graphics card"
            for model_name, p in GPU_PRICES_PKR.items():
                if model_name in msg:
                    found_price = p
                    found_name  = f"RTX/RX {model_name.upper()} GPU"
                    break
            if found_price:
                vram = GPU_VRAM.get(model_name, 8)
                result = self._wrap(found_price, found_name, f"{vram}GB VRAM", found_price > 150000)
                return result
            # No specific card → use tier-based prediction
            vram = 8
            for model_name, v in GPU_VRAM.items():
                if model_name in msg: vram = v; break
            tier  = self._detect_tier(msg)
            price = self._predict('component', [1, tier, vram])
            return self._wrap(price, "graphics card (GPU)", f"VRAM: {vram}GB", tier>=2)

        # ─── CPU ────────────────────────────────────────────────
        elif cat == 'cpu':
            CPU_PRICES_PKR = {
                '12400f':28000,'12400':30000,'12600k':38000,'12700f':42000,
                '12700':45000,'12900k':78000,'13600k':45000,'13700k':68000,
                '13900k':92000,'14900k':108000,
                '5600x':25000,'5600':23000,'5700x':32000,'5800x':42000,
                '5900x':58000,'5950x':88000,
                '7600x':35000,'7700x':52000,'7800x3d':68000,'7900x':82000,
                '7950x':128000,'i3 12100':18000,'i5 12400':28000,
            }
            found_price = None
            found_name  = "processor"
            for model_name, p in CPU_PRICES_PKR.items():
                if model_name in msg:
                    found_price = p
                    found_name  = f"{model_name.upper()} CPU"
                    break
            if found_price:
                return self._wrap(found_price, found_name, "", found_price > 60000)
            # Tier-based fallback
            cores = 6
            for model_name, c in CPU_CORES.items():
                if model_name in msg: cores = c; break
            tier  = self._detect_tier(msg)
            price = self._predict('component', [0, tier, cores])
            return self._wrap(price, "processor (CPU)", f"~{cores} cores", tier>=2)

        # ─── RAM ────────────────────────────────────────────────
        elif cat == 'ram':
            cap  = self._extract_ram(msg)
            if cap == 8: cap = 16  # default for RAM-only query
            ddr5 = 'ddr5' in msg
            # Direct lookup table (Pakistani market prices PKR)
            RAM_PRICES = {
                (4,  False): 3000,  (4,  True): 4500,
                (8,  False): 4500,  (8,  True): 6500,
                (16, False): 8500,  (16, True): 12000,
                (32, False): 16000, (32, True): 22000,
                (64, False): 30000, (64, True): 42000,
                (128,False): 60000, (128,True): 85000,
            }
            # Find nearest capacity in lookup
            caps = sorted(RAM_PRICES.keys(), key=lambda x:abs(x[0]-cap))
            best_key = next((k for k in caps if k[1]==ddr5), caps[0])
            price = RAM_PRICES[best_key]
            label = f"DDR5" if ddr5 else "DDR4"
            return self._wrap(price, f"{cap}GB {label} RAM", f"{cap}GB", False)

        # ─── MOTHERBOARD ────────────────────────────────────────
        elif cat == 'motherboard':
            MOBO_PRICES = {
                'a320':8000,'h510':10000,'b450':14000,'b550':22000,
                'b660':24000,'b760':28000,'x570':42000,'z690':55000,
                'x670':65000,'x670e':80000,'z790':72000,'z790e':95000,
                'trx50':180000,
            }
            found = None
            for chip, p in MOBO_PRICES.items():
                if chip in msg:
                    found = (chip.upper(), p); break
            if found:
                return self._wrap(found[1], f"{found[0]} motherboard", found[0], found[1]>40000)
            # Tier fallback
            if any(w in msg for w in ['x570','x670','z690','z790','flagship']): price,name=45000,'high-end motherboard'
            elif any(w in msg for w in ['b550','b660','mid']): price,name=24000,'mid-range motherboard'
            else: price,name=14000,'budget motherboard'
            return self._wrap(price, name, "", price>35000)

        # ─── COOLER ─────────────────────────────────────────────
        elif cat == 'cooler':
            COOLER_PRICES = {
                'air_budget': 4000,'air_mid': 9000,'air_premium': 16000,
                'aio_120': 10000,'aio_240': 18000,'aio_360': 28000,
            }
            if '360' in msg: key,kind='aio_360','360mm AIO'
            elif '280' in msg: key,kind='aio_360','280mm AIO'
            elif '240' in msg: key,kind='aio_240','240mm AIO'
            elif '120' in msg and 'aio' in msg: key,kind='aio_120','120mm AIO'
            elif any(w in msg for w in ['aio','liquid']): key,kind='aio_240','AIO liquid'
            elif 'noctua' in msg or 'be quiet' in msg: key,kind='air_premium','premium air cooler'
            elif 'deepcool' in msg or 'cooler master' in msg: key,kind='air_mid','mid air cooler'
            else: key,kind='air_budget','air cooler'
            price = COOLER_PRICES[key]
            is_aio = 'aio' in key
            return self._wrap(price, f"CPU {kind}", kind, is_aio)

        # ─── PSU ────────────────────────────────────────────────
        elif cat == 'psu':
            PSU_PRICES = {
                (450,'bronze'):5000,(500,'bronze'):6000,(550,'bronze'):7500,
                (600,'bronze'):8500,(650,'bronze'):10000,(650,'gold'):13000,
                (750,'gold'):16000,(750,'platinum'):21000,
                (850,'gold'):21000,(850,'platinum'):26000,
                (1000,'gold'):30000,(1000,'platinum'):40000,
            }
            wm = re.search(r'(\d+)\s*w', msg)
            watt = int(wm.group(1)) if wm else 650
            rating = 'platinum' if 'platinum' in msg else 'gold' if 'gold' in msg else 'bronze'
            best = min(PSU_PRICES.keys(), key=lambda k: (abs(k[0]-watt), k[1]!=rating))
            price = PSU_PRICES[best]
            return self._wrap(price, f"{watt}W {rating} PSU", f"{watt}W {rating}", rating!='bronze')

        # ─── CASE ───────────────────────────────────────────────
        elif cat == 'case':
            if any(w in msg for w in ['full tower','full-tower','extended']): tier = 3
            elif any(w in msg for w in ['tempered','glass','rgb','premium']): tier = 2
            elif any(w in msg for w in ['mid tower','mid-tower','atx']): tier = 1
            else: tier = self._detect_tier(msg)
            price = self._predict('component', [6, tier, 0])
            return self._wrap(price, "PC case/cabinet", f"{['basic ATX','mid-tower','tempered glass','full tower'][tier]}", tier>=2)

        # ─── SSD / NVMe ─────────────────────────────────────────
        elif cat == 'ssd':
            cap   = self._extract_storage(msg)
            is_nv = 1 if any(w in msg for w in ['nvme','m.2','pcie']) else 0
            price = self._predict('storage', [cap, 1, is_nv])
            kind  = 'NVMe SSD' if is_nv else 'SATA SSD'
            return self._wrap(price, f"{cap}GB {kind}", f"{cap}GB capacity", False)

        # ─── HDD / External ─────────────────────────────────────
        elif cat == 'hdd':
            cap   = self._extract_storage(msg)
            if cap == 512: cap = 1000
            price = self._predict('storage', [cap, 0, 0])
            return self._wrap(price, f"{cap}GB external/internal HDD", f"{cap}GB capacity", False)

        # ─── USB / Flash Drive ──────────────────────────────────
        elif cat == 'storage':
            cap   = self._extract_storage(msg)
            if cap == 512: cap = 128
            price = self._predict('storage', [cap, 1, 0])
            return self._wrap(price, f"{cap}GB USB flash drive", f"{cap}GB", False)

        # ─── ROUTER / NETWORKING ────────────────────────────────
        elif cat == 'router':
            is_w6  = 1 if any(w in msg for w in ['wifi 6','wifi6','ax','ax3000','ax6000']) else 0
            speed  = 6000 if any(w in msg for w in ['ax6000','9000']) else \
                     3000 if any(w in msg for w in ['ax3000','wifi 6','wifi6']) else \
                     1200
            ports  = 8 if any(w in msg for w in ['8 port','16 port','switch']) else 4
            price  = self._predict('networking', [speed, is_w6, ports])
            return self._wrap(price, f"WiFi {'6 ' if is_w6 else ''}router", f"{speed}Mbps", is_w6)

        # ─── KEYBOARD / MOUSE ───────────────────────────────────
        elif cat in ('keyboard','mouse'):
            tier  = self._detect_tier(msg)
            is_mech = 1 if any(w in msg for w in ['mechanical','mech','cherry','gateron']) else 0
            if is_mech: tier = max(tier, 2)
            price = self._predict('accessory', [0, tier])
            return self._wrap(price, f"keyboard/mouse combo", f"{'mechanical ' if is_mech else ''}{'wireless' if 'wireless' in msg else ''}", tier>=2)

        # ─── UPS ────────────────────────────────────────────────
        elif cat == 'ups':
            tier = 1
            if any(w in msg for w in ['600','650','700']): tier = 0
            elif any(w in msg for w in ['2000','2kva','3000','3kva']): tier = 2
            elif any(w in msg for w in ['online','4000','5000']): tier = 3
            price = self._predict('accessory', [2, tier])
            return self._wrap(price, "UPS / power backup", f"{'600VA' if tier==0 else '1200VA' if tier==1 else '2000VA' if tier==2 else '3000VA+'}", False)

        # ─── SPEAKER / HEADSET ──────────────────────────────────
        elif cat == 'speaker':
            tier  = self._detect_tier(msg)
            price = self._predict('accessory', [1, tier])
            return self._wrap(price, "bluetooth speaker", "", False)

        elif cat == 'headset':
            tier  = self._detect_tier(msg)
            if any(w in msg for w in ['airpods','sony wh','wh-1000','noise cancel']): tier = 3
            price = self._predict('accessory', [1, max(tier,1)])
            return self._wrap(price, "headset/headphones", "", tier>=2)

        # ─── CHARGER ────────────────────────────────────────────
        elif cat == 'charger':
            tier = 0
            if any(w in msg for w in ['65w','65 w']): tier = 1
            elif any(w in msg for w in ['100w','100 w','140w','140 w']): tier = 2
            price = self._predict('accessory', [3, tier])
            return self._wrap(price, f"{'65W' if tier==1 else '100W+' if tier==2 else 'standard'} charger", "", False)

        # ─── FALLBACK: generic prediction ───────────────────────
        else:
            # Try to guess from common patterns
            if re.search(r'\d+gb\s*(ram|memory)', msg):
                cat = 'ram'
                return self.predict(user_message + ' ram')
            if re.search(r'\d+\s*tb|\d+\s*gb\s*(ssd|hdd)', msg):
                cat = 'ssd'
                return self.predict(user_message + ' ssd')
            # Generic fallback — use laptop model with default params
            ram     = self._extract_ram(msg)
            storage = self._extract_storage(msg)
            premium = self._is_premium(msg)
            price   = self._predict('laptop', [ram, storage, int(premium), 15.6])
            return self._wrap(price, "device", f"{ram}GB RAM, {storage}GB storage", premium)

    def _wrap(self, price, device, specs, premium):
        price = max(price, 1500)  # floor at Rs.1,500
        low  = round(price * 0.87 / 500) * 500
        high = round(price * 1.15 / 500) * 500
        spec_str = f" with {specs}" if specs else ""
        msg = (
            f"📊 A **{device}**{spec_str} in Pakistan currently costs "
            f"around **Rs. {int(price):,}** PKR.\n\n"
            f"💰 Price range: Rs. {int(low):,} – Rs. {int(high):,} PKR\n\n"
            f"ℹ️ Prices vary by brand, retailer, and USD/PKR exchange rate. "
            f"This estimate is based on current Pakistani market data."
        )
        return {
            'predicted_price':  int(price),
            'price_range_low':  int(low),
            'price_range_high': int(high),
            'currency': 'PKR',
            'message':  msg,
            'parsed': {
                'device_type': device,
                'specs':       specs,
                'is_premium':  premium,
            }
        }


# ═══════════════════════════════════════════════════════════════════
#  INTENT MATCHING
# ═══════════════════════════════════════════════════════════════════
def match_intent(message):
    msg = message.lower()
    best, best_count = None, 0
    for name, data in INTENTS.items():
        count = sum(1 for kw in data['keywords'] if kw in msg)
        if count > best_count:
            best_count = count; best = name
    return best if best_count > 0 else None


# ═══════════════════════════════════════════════════════════════════
#  PRICE QUERY DETECTION
# ═══════════════════════════════════════════════════════════════════
PRICE_TRIGGERS = [
    'price','cost','kitna','predict','estimate','how much','kimat','rate',
    'rs ','pkr','rupee','rupees','afford','kharcha','budget','lena hai',
    'buy','purchase','worth','hoga','hogi','kaafi','laga','paise','paisa',
    'daam','value','cost kya','how','khareed','quote','rate kya'
]

DEVICE_HINT = re.compile(
    r'\b(\d+\s*gb|\d+\s*tb|rtx|gtx|rx\s*\d|ryzen|core\s*i\d|'
    r'laptop|phone|mobile|monitor|router|ssd|hdd|ram|gpu|cpu|ups|'
    r'keyboard|speaker|headset|charger|nvme|ddr[45]|wifi|iphone|macbook)\b',
    re.IGNORECASE
)

def is_price_query(msg):
    m = msg.lower()
    if any(t in m for t in PRICE_TRIGGERS): return True
    if DEVICE_HINT.search(msg): return True
    return False


# ═══════════════════════════════════════════════════════════════════
#  STARTUP
# ═══════════════════════════════════════════════════════════════════
print("\n" + "="*60)
print("  Master Computers ML Service — Starting")
print("="*60)
rec_engine = RecommendationEngine()
price_bot  = PricePredictionBot()
print("="*60)
print("  ✅  ML Service Ready")
print("="*60 + "\n")


# ═══════════════════════════════════════════════════════════════════
#  CORS
# ═══════════════════════════════════════════════════════════════════
@app.after_request
def cors(r):
    r.headers['Access-Control-Allow-Origin']  = '*'
    r.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    r.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return r

@app.route('/',          defaults={'path':''}, methods=['OPTIONS'])
@app.route('/<path:path>',                     methods=['OPTIONS'])
def preflight(path): return make_response('', 204)


# ═══════════════════════════════════════════════════════════════════
#  ROUTES
# ═══════════════════════════════════════════════════════════════════
@app.route('/health')
def health():
    return jsonify({'status':'ok','service':'Master Computers ML Service'})

@app.route('/recommend')
def recommend():
    pid   = request.args.get('product_id', type=int)
    top_n = request.args.get('top_n', default=4, type=int)
    if not pid:
        return jsonify({'error':'product_id required'}), 400
    return jsonify({'product_id':pid,'recommendations':rec_engine.recommend(pid,top_n),'algorithm':'K-Means'})

@app.route('/recommend/bulk', methods=['POST'])
def recommend_bulk():
    body = request.get_json() or {}
    ids  = body.get('viewed_product_ids', [])
    top_n= body.get('top_n', 6)
    if not ids:
        return jsonify({'recommendations': rec_engine.df.head(top_n)[['id','name','category','brand','price']].to_dict(orient='records')})
    all_recs = {}
    for pid in ids[-3:]:
        for r in rec_engine.recommend(pid, top_n):
            if r['id'] not in ids:
                all_recs[r['id']] = r
    return jsonify({'recommendations': list(all_recs.values())[:top_n], 'algorithm':'K-Means'})

@app.route('/clusters')
def clusters():
    return jsonify({'clusters': rec_engine.get_cluster_info()})

# ═══════════════════════════════════════════════════════════════════
#  LAPTOP PRICE PREDICTOR  — trained on data.csv
#  Features: brand, processor, CPU, Ram, Ram_type, ROM, ROM_type,
#            GPU, display_size, resolution_width, resolution_height,
#            OS, warranty
# ═══════════════════════════════════════════════════════════════════

_DATA_CSV = os.path.join(os.path.dirname(__file__), 'data.csv')

class LaptopPricePredictor:
    """
    Trains a Ridge Regression model on data.csv at startup.
    Keeps one-hot encoded column order so predictions are consistent.
    """
    OPTION_COLS = ['brand', 'processor', 'CPU', 'Ram', 'Ram_type',
                   'ROM', 'ROM_type', 'GPU', 'OS']
    NUM_COLS    = ['display_size', 'resolution_width', 'resolution_height', 'warranty']

    def __init__(self):
        self.model        = None
        self.feature_cols = None
        self.options      = {}
        self.r2           = None
        self.mae          = None
        self._train()

    def _train(self):
        if not os.path.exists(_DATA_CSV):
            print(f"[LaptopPredictor] data.csv not found at {_DATA_CSV}")
            return
        df = pd.read_csv(_DATA_CSV)
        # drop unnamed index columns if present
        df = df.drop(columns=[c for c in df.columns if c.startswith('Unnamed')], errors='ignore')

        # Build options dict for frontend dropdowns
        for col in self.OPTION_COLS:
            if col in df.columns:
                self.options[col] = sorted(df[col].dropna().unique().tolist(), key=str)
        if 'display_size' in df.columns:
            self.options['display_size'] = sorted(df['display_size'].dropna().unique().tolist())

        # Prepare features
        df_proc = df.copy()
        df_enc  = pd.get_dummies(df_proc, columns=self.OPTION_COLS, drop_first=False)
        X = df_enc.drop(columns=['price'])
        y = df_enc['price']
        self.feature_cols = X.columns.tolist()

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model = Ridge(alpha=1.0)
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        self.r2  = round(r2_score(y_test, y_pred), 4)
        self.mae = round(mean_absolute_error(y_test, y_pred), 2)
        print(f"[LaptopPredictor] Trained — R²={self.r2}  MAE=₨{self.mae:,.0f}")

    def predict(self, specs: dict) -> dict:
        """
        specs keys match data.csv columns (minus price).
        Returns predicted_price, price_range_low/high, r2, mae.
        """
        if self.model is None:
            raise RuntimeError("Model not trained — data.csv missing.")

        row = {col: specs.get(col) for col in self.OPTION_COLS + self.NUM_COLS}
        # numeric defaults
        row.setdefault('display_size',        15.6)
        row.setdefault('resolution_width',    1920)
        row.setdefault('resolution_height',   1080)
        row.setdefault('warranty',               1)

        df_row = pd.DataFrame([row])
        df_enc = pd.get_dummies(df_row, columns=self.OPTION_COLS, drop_first=False)
        # align columns with training set
        for col in self.feature_cols:
            if col not in df_enc.columns:
                df_enc[col] = 0
        df_enc = df_enc[self.feature_cols]

        price     = max(float(self.model.predict(df_enc)[0]), 0)
        margin    = price * 0.08          # ±8% confidence band
        return {
            'predicted_price':  int(round(price, -2)),
            'price_range_low':  int(round(price - margin, -2)),
            'price_range_high': int(round(price + margin, -2)),
            'r2':               self.r2,
            'mae':              self.mae,
            'specs':            specs,
        }

laptop_predictor = LaptopPricePredictor()


@app.route('/predict-price/options', methods=['GET'])
def predict_price_options():
    """Return all valid dropdown values for the price predictor form."""
    return jsonify(laptop_predictor.options)


@app.route('/predict-price', methods=['POST'])
def predict_price_direct():
    """
    Structured laptop price prediction using data.csv-trained Ridge model.

    Accepts JSON with any subset of:
      brand, processor, CPU, Ram, Ram_type, ROM, ROM_type,
      GPU, display_size, resolution_width, resolution_height, OS, warranty

    Falls back to legacy chatbot message if 'message' key is sent instead.
    """
    body = request.get_json() or {}

    # ── Legacy chatbot path (backwards-compatible) ──────────────────
    if 'message' in body and not any(k in body for k in ('brand', 'processor', 'Ram', 'ROM', 'GPU')):
        try:
            return jsonify(price_bot.predict(body['message']))
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    # ── New structured path ─────────────────────────────────────────
    specs = {
        'brand':              body.get('brand',            'Dell'),
        'processor':          body.get('processor',        '11th Gen Intel Core i5'),
        'CPU':                body.get('CPU',              'Hexa Core, 12 Threads'),
        'Ram':                body.get('Ram',              '8GB'),
        'Ram_type':           body.get('Ram_type',         'DDR4'),
        'ROM':                body.get('ROM',              '512GB'),
        'ROM_type':           body.get('ROM_type',         'SSD'),
        'GPU':                body.get('GPU',              'Intel Iris Xe Graphics'),
        'display_size':       float(body.get('display_size',       15.6)),
        'resolution_width':   int(body.get('resolution_width',    1920)),
        'resolution_height':  int(body.get('resolution_height',   1080)),
        'OS':                 body.get('OS',               'Windows 11 OS'),
        'warranty':           int(body.get('warranty',              1)),
    }
    try:
        result = laptop_predictor.predict(specs)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/chatbot', methods=['POST'])
def chatbot():
    body    = request.get_json() or {}
    message = body.get('message','').strip()
    if not message:
        return jsonify({'error':'message required'}), 400

    if is_price_query(message):
        result = price_bot.predict(message)
        return jsonify({'type':'price_prediction','response':result['message'],'data':result,'model':'Linear Regression'})

    intent = match_intent(message)
    if intent:
        return jsonify({'type':'faq','response':INTENTS[intent]['response'],'intent':intent})

    return jsonify({'type':'general','response':(
        "🤔 Ask me about prices! Examples:\n\n"
        "• 'RTX 4060 price?'\n• '16GB DDR5 RAM kitna hoga?'\n"
        "• 'Gaming laptop 32GB 1TB?'\n• 'iPhone 15 Pro price?'\n"
        "• '27 inch 4K monitor?'\n• 'Ryzen 5 5600X price?'\n"
        "• 'Budget UPS for PC?'\n• '1TB NVMe SSD?'"
    )})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
