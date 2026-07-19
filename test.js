
    // Firebase Imports
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, setDoc, serverTimestamp, increment, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // Firebase configurations
    const firebaseConfig = {
      apiKey: "AIzaSyDkOlJ-9fID5ZueTkwY8Qxv8GUFzNkkDAQ",
      authDomain: "food-new-york.firebaseapp.com",
      projectId: "food-new-york",
      storageBucket: "food-new-york.firebasestorage.app",
      messagingSenderId: "657168364944",
      appId: "1:657168364944:web:b03313fbe8ced9a4d3af15",
      measurementId: "G-LEPZHDYYPD"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Globals
    let cart = [];
    let deliveryOption = 'delivery';
    const deliveryFeeVal = 25;
    
    let allMenuItems = [];
    let activeCategory = 'all';
    let searchQuery = '';
    let currentMenuPage = 1;
    const itemsPerPage = 12;

    let userChatId = localStorage.getItem('userChatId') || null;
    let unsubscribeUserChat = null;

    AOS.init({ duration: 800, once: true });

    // Toast notification engine
    window.showToast = (message, type = 'success') => {
      const existingToast = document.querySelector('.toast-nyc');
      if (existingToast) existingToast.remove();

      const toast = document.createElement('div');
      toast.className = `toast-nyc ${type}`;
      
      let icon = 'fa-check-circle';
      if (type === 'error') icon = 'fa-exclamation-triangle';

      toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
      }, 3500);
    };

    // Navigation Pages
    window.showPage = (pageId) => {
      document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
      const activePage = document.getElementById(`page-${pageId}`);
      if (activePage) {
        activePage.classList.add('active');
        window.scrollTo(0, 0);
      }
      
      const collapseEl = document.getElementById('navItems');
      const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
      if (bsCollapse) bsCollapse.hide();

      if (pageId === 'menu') {
        renderMenuGrid();
      } else if (pageId === 'order') {
        renderOrderCheckoutPage();
      }
    };

    // Sticky Navbar
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('mainNav');
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });

    // ─── MASTER PRODUCTS LIST (USD $50 - $1000) ───
    const initialMenuItemsToSeed = [
      { id: 1, name: "Zinger Burger", price: 850, category: "fast-food", description: "Crispy chicken fillet", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" },
      { id: 2, name: "Chicken Pizza", price: 1950, category: "pizza", description: "Large chicken pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
      { id: 3, name: "Mutton Karahi", price: 2900, category: "main", description: "Traditional karahi", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500" },
      { id: 4, name: "Chicken Karahi", price: 2400, category: "main", description: "Fresh chicken karahi", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500" },
      { id: 5, name: "Seekh Kabab", price: 1400, category: "bbq", description: "Grilled kebabs", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500" },
      { id: 6, name: "Chicken Tikka", price: 1200, category: "bbq", description: "Marinated chicken", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500" },
      { id: 7, name: "Lava Cake", price: 750, category: "dessert", description: "Chocolate cake", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500" },
      { id: 8, name: "Mint Margarita", price: 350, category: "drinks", description: "Refreshing drink", image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=500" },
      { id: 9, name: "Beef Burger Deluxe", price: 850, category: "fast-food", description: "Juicy beef patty with fresh toppings", image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600" },
      {
          id: 9,
          name: "Club Sandwich Max",
          price: 750,
          category: "fast-food",
          description: "Triple decker sandwich with chicken and vegetables",
          image: "https://images.pexels.com/photos/1600727/pexels-photo-1600727.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 10,
          name: "Chicken Biryani Full",
          price: 950,
          category: "main",
          description: "Aromatic basmati rice with tender chicken",
          image: "https://images.pexels.com/photos/7394851/pexels-photo-7394851.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 12,
          name: "Chicken Tikka BBQ",
          price: 1600,
          category: "bbq",
          description: "Marinated chicken pieces grilled to perfection",
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 13,
          name: "Special Fish Fry",
          price: 1800,
          category: "main",
          description: "Fresh fish marinated and fried with spices",
          image: "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 14,
          name: "Mango Shake",
          price: 400,
          category: "drinks",
          description: "Thick and creamy mango shake",
          image: "https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 15,
          name: "Beef Burger Deluxe",
          price: 850,
          category: "fast-food",
          description: "Juicy beef patty with fresh toppings",
          image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 16,
          name: "Malai Boti",
          price: 1500,
          category: "bbq",
          description: "Creamy marinated chicken tikka",
          image: "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 17,
          name: "Gulab Jamun",
          price: 500,
          category: "dessert",
          description: "Traditional sweet dumplings in sugar syrup",
          image: "https://images.pexels.com/photos/4087611/pexels-photo-4087611.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 18,
          name: "Fresh Lime Soda",
          price: 300,
          category: "drinks",
          description: "Refreshing lime drink with soda",
          image: "https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 19,
          name: "SHA G Royal Mutton Karahi",
          price: 3800,
          category: "main",
          description: "Premium mutton cooked in traditional desi ghee with secret SHA G spices.",
          image: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 20,
          name: "Executive T-Bone Steak",
          price: 4500,
          category: "main",
          description: "Prime cut beef steak served with grilled vegetables and mushroom sauce.",
          image: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 21,
          name: "Jumbo Grilled Prawns",
          price: 5200,
          category: "bbq",
          description: "Fresh jumbo prawns marinated in lemon butter and charcoal grilled.",
          image: "https://images.pexels.com/photos/566344/pexels-photo-566344.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 22,
          name: "Whole Stuffed Sajji",
          price: 2800,
          category: "main",
          description: "Full chicken stuffed with aromatic rice and slow-roasted over charcoal.",
          image: "https://images.pexels.com/photos/233305/pexels-photo-233305.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 23,
          name: "Grand SHA G BBQ Platter",
          price: 4800,
          category: "bbq",
          description: "A royal mix of Kababs, Tikka, Malai Boti, and Chops for the whole family.",
          image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 24,
          name: "Beef Wellington Exclusive",
          price: 6500,
          category: "main",
          description: "Tender beef fillet wrapped in puff pastry with mushroom duxelles.",
          image: "https://images.pexels.com/photos/7613568/pexels-photo-7613568.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 25,
          name: "Mutton Kunna Clay Pot",
          price: 3400,
          category: "main",
          description: "Traditional Chinioti Mutton Kunna slow-cooked in a clay pot for 6 hours.",
          image: "https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 26,
          name: "Grilled Lobster Tail",
          price: 6800,
          category: "main",
          description: "Premium lobster tail served with garlic butter sauce and saffron rice.",
          image: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 27,
          name: "Turkish Adana Kebab Platter",
          price: 3500,
          category: "bbq",
          description: "Authentic spicy Turkish minced meat kebabs served with pita and hummus.",
          image: "https://images.pexels.com/photos/5946633/pexels-photo-5946633.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 28,
          name: "Desi Ghee Lamb Chops",
          price: 4200,
          category: "bbq",
          description: "Juicy lamb chops marinated in yogurt and pan-fried in pure desi ghee.",
          image: "https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 29,
          name: "College Hangout Deal",
          price: 2800,
          category: "main",
          description: "4 SHA G Burgers, 2 Jumbo Fries, and 1.5L Coke. Best for college friends and groups.",
          image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 30,
          name: "Romantic Dinner Date",
          price: 5500,
          category: "main",
          description: "2 Premium Steaks, 1 Chocolate Lava Cake, and 2 Mint Margaritas. Includes table decoration.",
          image: "https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 31,
          name: "Royal Family Feast",
          price: 12500,
          category: "main",
          description: "Full Mutton Karahi, 2 Large Pizzas, BBQ Platter, 2L Drinks, and 12 Gulab Jamuns. Serves 6-8.",
          image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 32,
          name: "Executive Business Buffet",
          price: 4500,
          category: "main",
          description: "Unlimited BBQ, 3 types of Handi, Chinese, Salad Bar, and Tea. Perfect for corporate meetings.",
          image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 33,
          name: "SHA G Birthday Blast Pack",
          price: 15000,
          category: "main",
          description: "Party for 10! Mixed BBQ, Fast Food Platter, Customized Cake, and unlimited soft drinks.",
          image: "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 34,
          name: "Couple's BBQ Night",
          price: 3200,
          category: "bbq",
          description: "Seekh Kabab, Malai Boti, Chicken Tikka, Raita, and Hot Naans. Specially for two.",
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 35,
          name: "Weekend Brunch Group",
          price: 4800,
          category: "main",
          description: "Special Halwa Puri, Nihari, Paye, and Lassi for a group of 4. Only on Saturday/Sunday.",
          image: "https://images.pexels.com/photos/103124/pexels-photo-103124.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 36,
          name: "SHA G Signature Elite Deal",
          price: 25000,
          category: "main",
          description: "The most expensive deal. Stuffed Lamb, Seafood Mix, Royal Desserts, and Private Cabin for 12.",
          image: "https://images.pexels.com/photos/6267/menu-restaurant-vintage-table.jpg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 35,
          name: "Classic Margherita",
          price: 1200,
          category: "pizza",
          description: "Traditional Italian style with fresh tomato sauce, basil, and pure mozzarella.",
          image: "https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 36,
          name: "SHA G Signature Tikka",
          price: 1650,
          category: "pizza",
          description: "Desi style spicy chicken tikka chunks with onions and green peppers.",
          image: "https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 37,
          name: "Spicy Chicken Fajita",
          price: 1750,
          category: "pizza",
          description: "Marinated fajita chicken, jalapeños, olives, and extra stringy cheese.",
          image: "https://images.pexels.com/photos/10790638/pexels-photo-10790638.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 38,
          name: "Premium Pepperoni Feast",
          price: 1850,
          category: "pizza",
          description: "Loaded with premium beef pepperoni slices and double mozzarella.",
          image: "https://images.pexels.com/photos/1552635/pexels-photo-1552635.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 39,
          name: "SHA G Stuffed Crust Gold",
          price: 2200,
          category: "pizza",
          description: "Cheese-filled crust with any topping of your choice. A 7-star favorite.",
          image: "https://images.pexels.com/photos/2619967/pexels-photo-2619967.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 40,
          name: "Veggie Delight Supreme",
          price: 1400,
          category: "pizza",
          description: "Corn, mushrooms, olives, peppers, and onions. Healthy and delicious.",
          image: "https://images.pexels.com/photos/3652899/pexels-photo-3652899.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 41,
          name: "Smokey BBQ Chicken Pizza",
          price: 1800,
          category: "pizza",
          description: "BBQ sauce base with grilled chicken, red onions, and sweet corn.",
          image: "https://images.pexels.com/photos/4394612/pexels-photo-4394612.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 42,
          name: "Royal Seafood Pizza",
          price: 2800,
          category: "pizza",
          description: "Premium topping of prawns and tuna with a hint of garlic and herbs.",
          image: "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 43,
          name: "Club Sandwich Max",
          price: 750,
          category: "pizza",
          description: "SHA G king",
          image: "https://images.pexels.com/photos/1600727/pexels-photo-1600727.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 44,
          name: "Assorted Turkish Baklava Box",
          price: 2500,
          category: "sweets",
          description: "Premium 500g box of authentic Turkish Baklava with pistachios and honey.",
          image: "https://images.pexels.com/photos/10313462/pexels-photo-10313462.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 45,
          name: "Belgian Chocolate Fudge Cake",
          price: 3800,
          category: "sweets",
          description: "Full 2lbs rich chocolate cake made with premium Belgian cocoa and dark chocolate.",
          image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 46,
          name: "New York Cheesecake (Slice)",
          price: 850,
          category: "sweets",
          description: "Creamy, smooth cheesecake on a graham cracker crust with strawberry topping.",
          image: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 47,
          name: "SHA G Royal Shahi Tukray",
          price: 1200,
          category: "sweets",
          description: "Traditional bread pudding slow-cooked in thick saffron milk and dry fruits.",
          image: "https://images.pexels.com/photos/1359302/pexels-photo-1359302.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 48,
          name: "Premium Macarons Gift Box",
          price: 1800,
          category: "sweets",
          description: "Box of 12 colorful French macarons with assorted flavors like lavender, rose, and pistachio.",
          image: "https://images.pexels.com/photos/239578/pexels-photo-239578.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 49,
          name: "Custom Fondant Celebration Cake",
          price: 4800,
          category: "sweets",
          description: "2kg custom designed cake for birthdays or anniversaries with edible fondant art.",
          image: "https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 50,
          name: "Desi Ghee Gajar Ka Halwa",
          price: 950,
          category: "sweets",
          description: "Fresh carrots slow-cooked in pure desi ghee and khoya. A winter special.",
          image: "https://images.pexels.com/photos/5639413/pexels-photo-5639413.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 51,
          name: "Premium Assorted Cookies Bucket",
          price: 1500,
          category: "sweets",
          description: "1kg freshly baked bakery cookies including Almond, Chocolate Chip, and Pistachio.",
          image: "https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 52,
          name: "SHA G Gold Leaf Matka Kheer",
          price: 2200,
          category: "sweets",
          description: "Elite kheer served in traditional clay pots decorated with real edible gold leaf.",
          image: "https://images.pexels.com/photos/4087611/pexels-photo-4087611.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 53,
          name: "Premium Fettuccine Alfredo",
          price: 1850,
          category: "main",
          description: "Creamy white sauce pasta with grilled chicken chunks, mushrooms, and imported parmesan cheese.",
          image: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 55,
          name: "Royal Mutton Raan Roast",
          price: 7500,
          category: "main",
          description: "Whole leg of lamb slow-roasted for 8 hours, marinated in secret SHA G royal spices. Serves 4-5.",
          image: "https://images.pexels.com/photos/541216/pexels-photo-541216.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 56,
          name: "Spicy Seafood Penne",
          price: 2400,
          category: "main",
          description: "Penne pasta tossed in spicy red arrabbiata sauce with sautéed prawns and calamari.",
          image: "https://images.pexels.com/photos/14737/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 57,
          name: "Saffron Pistachio Kheer",
          price: 1100,
          category: "sweets",
          description: "Traditional slow-cooked rice pudding infused with pure saffron and topped with roasted pistachios.",
          image: "https://images.pexels.com/photos/1359302/pexels-photo-1359302.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 59,
          name: "Premium Beef Nalli Nihari",
          price: 3200,
          category: "main",
          description: "Buffalo meat slow-cooked to perfection with bone marrow (Nalli) and authentic Nihari spices. Served with ginger and lemon.",
          image: "https://images.pexels.com/photos/604969/pexels-photo-604969.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 60,
          name: "SHA G Special Beef Karahi",
          price: 2800,
          category: "main",
          description: "Fresh buffalo meat stir-fried in a wok with tomatoes, green chilies, and black pepper. Authentic 7-star taste.",
          image: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 61,
          name: "Baked Chicken Lasagna",
          price: 2100,
          category: "main",
          description: "Layers of pasta sheet filled with minced chicken, red sauce, and topped with a heavy layer of melted mozzarella and cheddar.",
          image: "https://images.pexels.com/photos/5949900/pexels-photo-5949900.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 62,
          name: "Exotic Fruit Trifle Custard",
          price: 1250,
          category: "sweets",
          description: "Multi-layered dessert with vanilla custard, fresh seasonal fruits, jelly, and soft sponge cake. A family favorite.",
          image: "https://images.pexels.com/photos/2693447/pexels-photo-2693447.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 63,
          name: "Premium Fruit Cream Salad",
          price: 1450,
          category: "sweets",
          description: "A rich mix of fresh fruits, cocktail fruits, and dry fruits folded into chilled, whipped fresh cream.",
          image: "https://images.pexels.com/photos/11305342/pexels-photo-11305342.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 64,
          name: "Creamy Chicken Macaroni",
          price: 1650,
          category: "main",
          description: "Italian style macaroni tossed in a rich, creamy bechamel sauce with tender chicken chunks and bell peppers.",
          image: "https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 14,
          name: "Bana Shake",
          price: 400,
          category: "drinks",
          description: "Thick and creamy mango shake",
          image: "https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg?auto=compress&cs=tinysrgb&w=600"
      },
      {
          id: 15,
          name: "Beef Burger Deluxe",
          price: 850,
          category: "fast-food",
          description: "Juicy beef patty with fresh toppings",
          image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600"
      }
    ];

    // Master seed generator for items
    function generate1000Dishes() {
      allMenuItems = [...initialMenuItemsToSeed];
      // Random generation loop removed to only show the real 64 products
    }


    // Render Menu Grid based on filter/search and page
    window.filterMenu = (category, btn) => {
      activeCategory = category;
      currentMenuPage = 1;
      
      document.querySelectorAll('.menu-cats .cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      renderMenuGrid();
    };

    window.searchMenu = () => {
      searchQuery = document.getElementById('menuSearchInput').value.trim().toLowerCase();
      currentMenuPage = 1;
      renderMenuGrid();
    };

    function renderMenuGrid() {
      const grid = document.getElementById('menuItemsGrid');
      grid.innerHTML = "";

      let filtered = allMenuItems.filter(item => {
        if (!item) return false;
        const itemCategory = item.category || "";
        const itemName = item.name || "";
        const itemDesc = item.description || "";
        
        const matchesCat = (activeCategory === 'all' || itemCategory === activeCategory || (activeCategory === 'sweets' && itemCategory === 'dessert'));
        const matchesSearch = itemName.toLowerCase().includes(searchQuery) || itemDesc.toLowerCase().includes(searchQuery);
        return matchesCat && matchesSearch;
      });

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
      if (currentMenuPage > totalPages) currentMenuPage = totalPages;
      
      document.getElementById('pageIndicator').innerText = `Page ${currentMenuPage} of ${totalPages}`;
      document.getElementById('prevPageBtn').disabled = (currentMenuPage === 1);
      document.getElementById('nextPageBtn').disabled = (currentMenuPage === totalPages);

      const startIndex = (currentMenuPage - 1) * itemsPerPage;
      const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

      if (paginatedItems.length === 0) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="fas fa-search d-block mb-3 text-warning" style="font-size: 2.5rem;"></i>
            <h5 class="text-dark">No products found</h5>
            <p class="text-muted">Try searching for other terms.</p>
          </div>
        `;
        return;
      }

      paginatedItems.forEach(item => {
        if (!item) return;
        const itemName = item.name || "Unnamed Item";
        const itemCategory = item.category || "General";
        const itemDesc = item.description || "";
        const itemImage = item.image || "logo.png";
        
        const cartItem = cart.find(c => c.name === itemName);
        const qty = cartItem ? cartItem.qty : 0;

        const card = document.createElement('div');
        card.className = "col-lg-3 col-md-4 col-sm-6"
        card.innerHTML = `
          <div class="dish-card" data-aos="fade-up">
            <div class="dish-img">
              <img src="${itemImage}" alt="${itemName}">
              <span class="dish-badge">${itemCategory.replace('-', ' ')}</span>
            </div>
            <div class="dish-body">
              <h5 class="dish-name" title="${itemName}">${itemName}</h5>
              <p class="dish-desc">${itemDesc}</p>
              <div class="dish-footer">
                <span class="dish-price">$${item.price || 0}</span>
                ${qty > 0 ? `
                  <div class="qty-ctrl">
                    <button class="qty-btn" onclick="updateCartQty('${itemName}', -1)">-</button>
                    <span class="qty-num">${qty}</span>
                    <button class="qty-btn" onclick="updateCartQty('${itemName}', 1)">+</button>
                  </div>
                ` : `
                  <button class="add-btn" onclick="addToCart('${itemName}', ${item.price || 0}, '${itemImage}')"><i class="fas fa-plus"></i></button>
                `}
              </div>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    window.changeMenuPage = (direction) => {
      currentMenuPage += direction;
      renderMenuGrid();
      document.getElementById('page-menu').scrollIntoView({ behavior: 'smooth' });
    };

    // ─── CART SYSTEM ───
    window.addToCart = (name, price, image) => {
      const existing = cart.find(c => c.name === name);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ name, price, image, qty: 1 });
      }
      updateCartDisplay();
      window.showToast(`Added ${name} to cart.`, 'info');
    };

    window.updateCartQty = (name, change) => {
      const idx = cart.findIndex(c => c.name === name);
      if (idx !== -1) {
        cart[idx].qty += change;
        if (cart[idx].qty <= 0) {
          cart.splice(idx, 1);
        }
      }
      updateCartDisplay();
      if (document.getElementById('page-menu').classList.contains('active')) {
        renderMenuGrid();
      }
    };

    function updateCartDisplay() {
      const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
      document.getElementById('cart-count').innerText = totalQty;

      const listContainer = document.getElementById('cartItemsList');
      listContainer.innerHTML = "";

      if (cart.length === 0) {
        listContainer.innerHTML = `
          <div class="text-center py-5 text-secondary">
            <i class="fas fa-shopping-basket d-block mb-3" style="font-size: 3rem; color: #ccc;"></i>
            Your cart is currently empty.
          </div>
        `;
        document.getElementById('cartSubtotal').innerText = "$0.00";
        document.getElementById('cartGrandTotal').innerText = "$0.00";
        document.getElementById('checkoutModalBtn').disabled = true;
        document.getElementById('cartLimitWarning').style.display = "none";
        return;
      }

      let subtotal = 0;
      cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const row = document.createElement('div');
        row.className = "cart-item";
        row.innerHTML = `
          <div class="cart-item-info">
            <img src="${item.image}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-details">
              <h6>${item.name}</h6>
              <span>$${item.price}</span>
            </div>
          </div>
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="updateCartQty('${item.name}', -1)">-</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.name}', 1)">+</button>
          </div>
        `;
        listContainer.appendChild(row);
      });

      const deliveryFee = deliveryOption === 'delivery' ? deliveryFeeVal : 0;
      const grandTotal = subtotal + deliveryFee;

      document.getElementById('cartSubtotal').innerText = `$${subtotal.toFixed(2)}`;
      document.getElementById('cartDeliveryFee').innerText = `$${deliveryFee.toFixed(2)}`;
      document.getElementById('cartGrandTotal').innerText = `$${grandTotal.toFixed(2)}`;

      if (grandTotal < 100) {
        document.getElementById('checkoutModalBtn').disabled = true;
        document.getElementById('cartLimitWarning').style.display = "block";
      } else {
        document.getElementById('checkoutModalBtn').disabled = false;
        document.getElementById('cartLimitWarning').style.display = "none";
      }
    }

    window.proceedToCheckout = () => {
      showPage('order');
    };

    // ─── ORDER PAGE (QR FLOW) ───
    window.switchPaymentMethod = (method, address, btn) => {
      document.querySelectorAll('.payment-methods .pay-method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('paymentAddressText').innerText = `${method.toUpperCase()} Address: ${address}`;
    };

    window.setDeliveryMode = (mode) => {
      deliveryOption = mode;
      document.getElementById('opt-delivery').classList.toggle('active', mode === 'delivery');
      document.getElementById('opt-pickup').classList.toggle('active', mode === 'pickup');
      document.getElementById('deliveryAddressWrap').style.display = mode === 'delivery' ? 'block' : 'none';
      updateCartDisplay();
      renderOrderCheckoutPage();
    };

    function renderOrderCheckoutPage() {
      const preview = document.getElementById('checkoutCartPreview');
      const formWrap = document.getElementById('checkoutFormWrapper');
      
      if (cart.length === 0) {
        preview.innerHTML = `
          <div class="text-center py-5 text-secondary">
            <i class="fas fa-shopping-bag d-block mb-3" style="font-size: 3rem; color: #ccc;"></i>
            Your cart is empty.<br>Go to <a href="javascript:showPage('menu')" style="color: var(--gold-dark); text-decoration: underline;">Products</a> to add items.
          </div>
        `;
        formWrap.style.display = "none";
        return;
      }

      preview.innerHTML = `
        <div class="table-responsive">
          <table class="table m-0" style="font-size: 0.85rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <th>Product Name</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td>${item.name}</td>
                  <td class="text-center">${item.qty}</td>
                  <td class="text-end" style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">$${item.price * item.qty}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const deliveryFee = deliveryOption === 'delivery' ? deliveryFeeVal : 0;
      const grandTotal = subtotal + deliveryFee;

      const totalBox = document.getElementById('checkoutTotalBox');
      totalBox.innerHTML = `
        <div class="d-flex justify-content-between text-secondary mb-2" style="font-size: 0.82rem;">
          <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between text-secondary mb-2" style="font-size: 0.82rem;">
          <span>Delivery Fee</span><span>$${deliveryFee.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between border-top pt-3 mt-2">
          <strong>Amount Due</strong>
          <strong class="cart-total-final" style="font-size: 1.4rem;">$${grandTotal.toFixed(2)}</strong>
        </div>
      `;

      formWrap.style.display = "block";
    }

    // Checkout submission
    window. NYC_Active_Order_Id = null;
    window.handlePlaceOrder = async (e) => {
      e.preventDefault();
      
      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const deliveryFee = deliveryOption === 'delivery' ? deliveryFeeVal : 0;
      const grandTotal = subtotal + deliveryFee;

      if (grandTotal < 100) {
        window.showToast("Minimum checkout amount is $100.", "error");
        return;
      }

      const name = document.getElementById('checkName').value.trim();
      const phone = document.getElementById('checkPhone').value.trim();
      const email = document.getElementById('checkEmail').value.trim();
      const notes = document.getElementById('checkNotes').value.trim();
      const address = deliveryOption === 'delivery' ? document.getElementById('checkAddress').value.trim() : 'N/A (Self Pickup)';

      try {
        const orderRef = await addDoc(collection(db, "orders"), {
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          deliveryMode: deliveryOption,
          deliveryAddress: address,
          specialNotes: notes,
          items: cart,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          grandTotal: grandTotal,
          status: "Pending Payment Confirmation",
          timestamp: serverTimestamp()
        });

        const orderId = orderRef.id;
        window.NYC_Active_Order_Id = orderId;

        if (!userChatId) {
          userChatId = `chat_${Date.now()}`;
          localStorage.setItem('userChatId', userChatId);
        }

        await setDoc(doc(db, "chats", userChatId), {
          id: userChatId,
          userName: name,
          userPhone: phone,
          lastMessage: `Placed order: #${orderId.substring(0,6)}`,
          lastMessageTimestamp: serverTimestamp(),
          adminUnreadCount: increment(1)
        }, { merge: true });

        await addDoc(collection(db, "chats", userChatId, "messages"), {
          sender: "user",
          text: `🔔 ORDER FILED: Hello! I placed order #${orderId.substring(0, 8)} for $${grandTotal.toFixed(2)}. I sent payment via QR code.`,
          timestamp: serverTimestamp()
        });

        listenToUserChat();

        cart = [];
        updateCartDisplay();
        document.getElementById('nycCheckoutForm').reset();
        
        window.showToast("Order submitted successfully.", "success");
        
        const preview = document.getElementById('checkoutCartPreview');
        preview.innerHTML = `
          <div class="text-center py-5" style="background: rgba(46, 125, 50, 0.05); border: 1px solid var(--border-color); border-radius: 16px;">
            <i class="fas fa-check-circle d-block mb-3 text-success" style="font-size: 3.5rem;"></i>
            <h4>Payment Verification Pending</h4>
            <p class="text-muted mt-2" style="font-size: 0.9rem;">Invoice ID: <strong>#${orderId}</strong></p>
            <p class="text-gray px-4" style="font-size: 0.8rem; line-height: 1.5;">Our team is reviewing the payment transaction. Watch the chat window below for real-time confirmation.</p>
            
            <!-- Direct receipt chat subwidget -->
            <div class="receipt-chat-box text-start">
              <h6 class="mb-2"><i class="fas fa-comments text-warning me-1"></i>Chat with Billing Team</h6>
              <div class="receipt-chat-history" id="receiptChatBody">
                <!-- Inner chat -->
              </div>
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm" id="receiptChatInputField" placeholder="Type message to team..." onkeydown="handleReceiptChatKey(event)">
                <button class="btn btn-warning btn-sm fw-bold text-dark px-3" onclick="sendReceiptChatMessage()">Send</button>
              </div>
            </div>
          </div>
        `;
        document.getElementById('checkoutFormWrapper').style.display = "none";
        
      } catch (error) {
        console.error("Order submission failed:", error);
        window.showToast("Order checkout failed.", "error");
      }
    };

    // Receipt chat functions
    window.sendReceiptChatMessage = async () => {
      const input = document.getElementById('receiptChatInputField');
      const text = input.value.trim();
      if (!text || !userChatId) return;

      input.value = "";

      try {
        await setDoc(doc(db, "chats", userChatId), {
          lastMessage: text,
          lastMessageTimestamp: serverTimestamp(),
          adminUnreadCount: increment(1)
        }, { merge: true });

        await addDoc(collection(db, "chats", userChatId, "messages"), {
          sender: "user",
          text: text,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error("Message send failed:", err);
      }
    };

    window.handleReceiptChatKey = (e) => {
      if (e.key === 'Enter') sendReceiptChatMessage();
    };

    function listenToUserChat() {
      if (!userChatId) return;

      const q = query(collection(db, "chats", userChatId, "messages"), orderBy("timestamp", "asc"));
      unsubscribeUserChat = onSnapshot(q, (snapshot) => {
        const body = document.getElementById('receiptChatBody');
        if (!body) return; // Only update if receipt chat body is open
        
        body.innerHTML = "";
        snapshot.forEach(docSnap => {
          const msg = docSnap.data();
          const bubble = document.createElement('div');
          bubble.className = `receipt-chat-bubble ${msg.sender === 'user' ? 'sent' : 'received'}`;
          bubble.innerText = msg.text;
          body.appendChild(bubble);
        });

        body.scrollTop = body.scrollHeight;
      });
    }

    // ─── RESERVATIONS BOOKING ───
    window.handlePlaceBooking = async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('bookName').value.trim();
      const phone = document.getElementById('bookPhone').value.trim();
      const email = document.getElementById('bookEmail').value.trim();
      const guests = document.getElementById('bookGuests').value;
      const date = document.getElementById('bookDate').value;
      const time = document.getElementById('bookTime').value;
      const notes = document.getElementById('bookNotes').value.trim();

      try {
        await addDoc(collection(db, "bookings"), {
          name, phone, email, guests, date, time, notes,
          timestamp: serverTimestamp()
        });

        window.showToast("Table reservation successful!", "success");
        document.getElementById('tableReservationForm').reset();
      } catch (error) {
        console.error("Booking error:", error);
        window.showToast("Reservation failed.", "error");
      }
    };

    // ─── RECOMMENDATION POPUP SYSTEM ───
    let currentRecDish = null;
    let recTimer = null;
    let recHovered = false;
    let quickDeliveryOption = 'delivery';
    const quickDeliveryFeeVal = 25;

    function startRecommendationCycle() {
      if (recTimer) clearInterval(recTimer);
      recTimer = setInterval(() => {
        if (recHovered || !allMenuItems.length) return;
        showRandomRecommendation();
      }, 3000); // Trigger every 3 seconds
    }

    function showRandomRecommendation() {
      // Pick a random dish from catalog
      const randomIndex = Math.floor(Math.random() * allMenuItems.length);
      currentRecDish = allMenuItems[randomIndex];
      
      const popup = document.getElementById('dishRecommendationPopup');
      const img = document.getElementById('recDishImg');
      const name = document.getElementById('recDishName');
      const desc = document.getElementById('recDishDesc');
      const price = document.getElementById('recDishPrice');

      // Hide first, update content, then animate in
      popup.classList.remove('active');
      
      setTimeout(() => {
        img.src = currentRecDish.image;
        name.innerText = currentRecDish.name;
        desc.innerText = currentRecDish.description;
        price.innerText = `$${currentRecDish.price}`;
        popup.classList.add('active');
      }, 500);
    }

    window.closeRecommendationPopup = () => {
      document.getElementById('dishRecommendationPopup').classList.remove('active');
      // Suspend recommendation for a bit (restart timer)
      if (recTimer) clearInterval(recTimer);
      setTimeout(startRecommendationCycle, 5000); // Wait 5 seconds after close before resuming
    };

    // Pause on hover
    setTimeout(() => {
      const recPopupEl = document.getElementById('dishRecommendationPopup');
      if (recPopupEl) {
        recPopupEl.addEventListener('mouseenter', () => { recHovered = true; });
        recPopupEl.addEventListener('mouseleave', () => { recHovered = false; });
      }
    }, 1000);

    // Quick Order Modal Actions
    window.openQuickOrderFromRec = () => {
      if (!currentRecDish) return;
      document.getElementById('dishRecommendationPopup').classList.remove('active');
      
      // Populate Quick Order Modal
      document.getElementById('quickOrderDishImg').src = currentRecDish.image;
      document.getElementById('quickOrderDishName').innerText = currentRecDish.name;
      document.getElementById('quickOrderDishDesc').innerText = currentRecDish.description;
      document.getElementById('quickOrderDishPrice').innerText = `$${currentRecDish.price}`;

      setQuickDeliveryMode('delivery');
      
      // Open Bootstrap Modal reliably
      const modalEl = document.getElementById('quickOrderModal');
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    };

    window.switchQuickPayMethod = (method, address, btn) => {
      document.querySelectorAll('#quickOrderModal .payment-methods .pay-method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('quickPayAddressText').innerText = `${method.toUpperCase()}: ${address}`;
    };

    window.setQuickDeliveryMode = (mode) => {
      quickDeliveryOption = mode;
      document.getElementById('quick-opt-delivery').classList.toggle('active', mode === 'delivery');
      document.getElementById('quick-opt-pickup').classList.toggle('active', mode === 'pickup');
      
      // Styling toggles for visual state
      if (mode === 'delivery') {
        document.getElementById('quick-opt-delivery').style.borderColor = 'var(--gold)';
        document.getElementById('quick-opt-delivery').style.background = 'rgba(197,168,80,0.05)';
        document.getElementById('quick-opt-pickup').style.borderColor = 'var(--border-color)';
        document.getElementById('quick-opt-pickup').style.background = 'transparent';
        document.getElementById('quickDeliveryAddressWrap').style.display = 'block';
        document.getElementById('quickCheckAddress').required = true;
      } else {
        document.getElementById('quick-opt-pickup').style.borderColor = 'var(--gold)';
        document.getElementById('quick-opt-pickup').style.background = 'rgba(197,168,80,0.05)';
        document.getElementById('quick-opt-delivery').style.borderColor = 'var(--border-color)';
        document.getElementById('quick-opt-delivery').style.background = 'transparent';
        document.getElementById('quickDeliveryAddressWrap').style.display = 'none';
        document.getElementById('quickCheckAddress').required = false;
      }
      updateQuickOrderTotal();
    };

    function updateQuickOrderTotal() {
      if (!currentRecDish) return;
      const subtotal = currentRecDish.price;
      const deliveryFee = quickDeliveryOption === 'delivery' ? quickDeliveryFeeVal : 0;
      const total = subtotal + deliveryFee;
      document.getElementById('quickOrderTotalText').innerText = `$${total.toFixed(2)}`;
    }

    // Submit Instant Quick Order
    window.handlePlaceQuickOrder = async (e) => {
      e.preventDefault();
      if (!currentRecDish) return;

      const subtotal = currentRecDish.price;
      const deliveryFee = quickDeliveryOption === 'delivery' ? quickDeliveryFeeVal : 0;
      const grandTotal = subtotal + deliveryFee;

      const name = document.getElementById('quickCheckName').value.trim();
      const phone = document.getElementById('quickCheckPhone').value.trim();
      const email = document.getElementById('quickCheckEmail').value.trim();
      const notes = document.getElementById('quickCheckNotes').value.trim();
      const address = quickDeliveryOption === 'delivery' ? document.getElementById('quickCheckAddress').value.trim() : 'N/A (Self Pickup)';

      try {
        const orderRef = await addDoc(collection(db, "orders"), {
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          deliveryMode: quickDeliveryOption,
          deliveryAddress: address,
          specialNotes: notes,
          items: [{
            name: currentRecDish.name,
            price: currentRecDish.price,
            image: currentRecDish.image,
            qty: 1
          }],
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          grandTotal: grandTotal,
          status: "Pending Payment Confirmation",
          timestamp: serverTimestamp()
        });

        const orderId = orderRef.id;
        window.NYC_Active_Order_Id = orderId;

        // Establish customer-admin chat connection
        if (!userChatId) {
          userChatId = `chat_${Date.now()}`;
          localStorage.setItem('userChatId', userChatId);
        }

        await setDoc(doc(db, "chats", userChatId), {
          id: userChatId,
          userName: name,
          userPhone: phone,
          lastMessage: `Placed instant order: #${orderId.substring(0,6)}`,
          lastMessageTimestamp: serverTimestamp(),
          adminUnreadCount: increment(1)
        }, { merge: true });

        await addDoc(collection(db, "chats", userChatId, "messages"), {
          sender: "user",
          text: `🔔 INSTANT ORDER: Hello! I placed an instant order for ${currentRecDish.name} (#${orderId.substring(0, 8)}) for $${grandTotal.toFixed(2)}. Payment proof sent.`,
          timestamp: serverTimestamp()
        });

        listenToUserChat();

        // Close quick order modal
        const modalEl = document.getElementById('quickOrderModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();

        document.getElementById('nycQuickCheckoutForm').reset();
        window.showToast("Instant order submitted successfully!", "success");

        // Redirect to Order tab and render the payment waiting screen
        showPage('order');
        const preview = document.getElementById('checkoutCartPreview');
        preview.innerHTML = `
          <div class="text-center py-5" style="background: rgba(46, 125, 50, 0.05); border: 1px solid var(--border-color); border-radius: 16px;">
            <i class="fas fa-check-circle d-block mb-3 text-success" style="font-size: 3.5rem;"></i>
            <h4>Payment Verification Pending</h4>
            <p class="text-muted mt-2" style="font-size: 0.9rem;">Invoice ID: <strong>#${orderId}</strong></p>
            <p class="text-gray px-4" style="font-size: 0.8rem; line-height: 1.5;">Our team is reviewing the payment transaction. Watch the chat window below for real-time confirmation.</p>
            
            <!-- Direct receipt chat subwidget -->
            <div class="receipt-chat-box text-start">
              <h6 class="mb-2"><i class="fas fa-comments text-warning me-1"></i>Chat with Billing Team</h6>
              <div class="receipt-chat-history" id="receiptChatBody">
                <!-- Inner chat -->
              </div>
              <div class="d-flex gap-2">
                <input type="text" class="form-control form-control-sm" id="receiptChatInputField" placeholder="Type message to team..." onkeydown="handleReceiptChatKey(event)">
                <button class="btn btn-warning btn-sm fw-bold text-dark px-3" onclick="sendReceiptChatMessage()">Send</button>
              </div>
            </div>
          </div>
        `;
        document.getElementById('checkoutFormWrapper').style.display = "none";
        
      } catch (error) {
        console.error("Instant order failed:", error);
        window.showToast("Instant checkout failed.", "error");
      }
    };

    // Startup Init — run immediately (inline script, DOM already built above)
    generate1000Dishes();

    // Use window.onload so grid renders after DOM is fully accessible
    window.onload = () => {
      renderMenuGrid();

      setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 800);
        }
      }, 800);

      startRecommendationCycle();
    };

  
