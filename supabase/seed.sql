insert into public.branches(name) select 'Bareeq — Helwan' where not exists(select 1 from public.branches);
insert into public.categories(id,name) values('Coffee','Coffee') on conflict do nothing;
insert into public.categories(id,name) values('Cakes & Sweets','Cakes & Sweets') on conflict do nothing;
insert into public.categories(id,name) values('Savory','Savory') on conflict do nothing;
insert into public.categories(id,name) values('Matcha','Matcha') on conflict do nothing;
insert into public.categories(id,name) values('Refreshers','Refreshers') on conflict do nothing;
insert into public.categories(id,name) values('Other','Other') on conflict do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('0e0O1GEDvZQCHk9zuvfd','iced-spanish-latte-0e0o','Iced Spanish Latte','Coffee','Fresh milk, espresso, condensed milk and the magic of bareeq
',11500,true,'/assets/hero-coffee.webp',true) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('La5EfigDxNwOuGZdhrp1','carrot-cake-la5e','Carrot Cake','Cakes & Sweets','Carrot Cake
Walnut 
',12000,true,'/assets/carrot-cake.webp',false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('pZewXt6dIwuqTtd4JKLq','red-velvet-cake-pzew','Red velvet cake','Cakes & Sweets','',12000,true,'/assets/red-velvet.webp',false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('uvMOrdoN5cPV95R3RzdY','chocolate-cake-walnut-uvmo','Chocolate Cake Walnut','Cakes & Sweets','Chocolate cake with fresh Walnut 
',10000,true,'/assets/chocolate-cake.webp',false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('K10wmMm2bSukv3YtobGe','american-donuts-k10w','American donuts','Cakes & Sweets','American donuts ',8000,true,'/assets/donut.webp',false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('BxTpsqsT04EuGmULIfWe','tuna-melt-sandwich-bxtp','Tuna Melt Sandwich','Savory','vegetable 
Tuna, 
mayonnaise,
 cheese,
 brown bread
Sweet corn and red kidney bean mix',10000,true,'/assets/sandwich.webp',false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('tvwM18zSJg1vek6NxulB','japanese-matcha-latte-tvwm','Japanese Matcha Latte','Matcha','Japanese Matcha ',12000,true,'/assets/matcha.webp',true) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('pPQhdBL7qrvaB4BCeQvv','sunshine-strawberry-ppqh','Sunshine Strawberry','Refreshers','Fresh , lemon, mint, Strawberry SODA
',8000,true,'/assets/berry.webp',true) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('0SZ18GinjTC2jH6YeQGg','sunshine-blue-lemonade-0sz1','Sunshine Blue Lemonade','Refreshers','Blue Lemon Fresh , lemon, mint SODA
',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('1UTDuORXxmn3oNlO8sgX','blueberry-smoothie-1utd','Blueberry Smoothie','Refreshers','wild blueberry fruit  water and a  touch bareeq 
',9000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('21ddRnbimcaJOeKuRKVD','brazilian-coffee-21dd','Brazilian Coffee','Coffee','Brazilian Black Diamond
',60000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('2IhSr9hjNTq0ma9aq7Xq','hazelnut-2ihs','Hazelnut','Other','',3000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('2VDqaI9bGsYjN5XwhMNl','pistachio-croissant-2vdq','Pistachio Croissant','Cakes & Sweets','Fresh butter croissant and pistachio cream
',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('3WkU360HDtIFSriH1bgq','kinder-cookies-3wku','Kinder Cookies','Cakes & Sweets','Kinder cookies
',8500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('7Del56XKKne1FqDOammT','mango-7del','Mango','Refreshers','',7000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('8wzIylAT1chTgxpgI6tD','vanilla-spice-latte-8wzi','Vanilla Spice Latte ☕✨','Coffee','Fresh Milk
* Cinnamon
* Vanilla
* Espresso',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('9Vsvk5a4jrGfPdNho6N9','aero-press-9vsv','Aero press','Coffee','',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('BGmr68f4EZY9l07xcynn','pistachio-cream-blend-bgmr','Pistachio Cream Blend','Other','Pistachio Cream Espresso  optional    Vanilla    milk


',13000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('BUawbQ6jl3mNqV73vKZU','cinnamon-roll-buaw','Cinnamon Roll','Cakes & Sweets','Cinnamon cake Roll',9000,false,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('BnZe0gfcIq5kjOvVCcU2','cinnamon-caramel-latte-bnze','Cinnamon Caramel Latte','Coffee','Caramel, las cinnamon fresh milk, espresso, and a touch of bareeq magic ✨',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('BoxuyJphbJe0pj2x2MK5','classic-cheesecake-boxu','Classic Cheesecake','Cakes & Sweets','Plain Cheesecake',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('EKESBGd5LUHbyxjEmxno','turkish-coffee-ekes','Turkish coffee','Coffee','Turkish coffee
A blend of Brazilian and Colombian coffee
',27000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('F8Zq3pkxZAEF0bURtNeG','hot-spanish-matcha-f8zq','Hot Spanish Matcha','Matcha','ماتشا اسبانش ياباني ',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('FCX7bFjODSGqUE970vpe','spanish-blend-fcx7','Spanish Blend','Other','Condensed milk, espresso, fresh milk powder, vanilla, ice
',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('FHAYs4OKHMPJA7tzRhzB','japanese-strawberry-matcha-cream-fhay','Japanese Strawberry Matcha Cream','Matcha','Japanese Matcha 
Strawberry 
',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('FIcB3snPqrINkFdpSd2K','caramel-blend-ficb','Caramel Blend','Other','Caramel, milk powder, vanilla, espresso
',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('FLBiVGfItAGRwnbum201','peach-iced-tea-flbi','Peach Iced Tea','Refreshers','Peach  Tea water A little sugar iced
',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('FkchVVQzCjoGHhJpn2Sk','iced-salted-caramel-latte-fkch','Iced Salted Caramel Latte','Coffee','Fresh milk, espresso, salted caramel, and a touch of bareeq',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('GFtJLFYpOFGg8iWG3J1p','strawberry-gftj','Strawberry','Other','',3000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('I8snVZxg1wQzkY0w83M3','red-bull-i8sn','Red Bull ⚡🥤','Refreshers','',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('IEi1bD3yVaqXuljQeFot','nutella-iei1','Nutella','Other','',3000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('IPNTwtg68TTXrmLrA9g2','fresh-orange-juice-ipnt','Fresh Orange Juice','Refreshers','Orange juice',7000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('Im3YeBDVy3GMF9WXVgbY','strawberry-hot-chocolate-im3y','Strawberry hot chocolate','Other','',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('J1z0ZfA84ODcheTbhxu6','sandwich-j1z0','Sandwich','Savory','Sandwich cheese& Turkish chicken &Lettuce& Sweet pepper &A little mayonnaise
',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('J6TpCAwfBltkuWtjPGEy','hot-caramel-macchiato-j6tp','Hot Caramel Macchiato','Coffee','Caramel, fresh milk, espresso, and a touch of bareeq magic ✨',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('KYmQ5txew3dh3HFvPVhQ','sparkling-water-kymq','SPARKLING WATER','Refreshers','',5000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('LzTK0vE2z5qRhZnDqzce','russian-honey-cake-lztk','Russian Honey Cake','Cakes & Sweets','Russian Honey Cake',9000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('MO10PqJcp5zBoj6G7NWh','sunshine-blueberry-mo10','Sunshine Blueberry','Refreshers','Blueberry SODA LEMON MINT ',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('MZ2b11TyKRLjNRVRgfMl','turkish-cheese-croissant-mz2b','Turkish Cheese Croissant','Savory',' Croissant cheese& Turkish chicken &Lettuce& Sweet pepper &A little mayonnaise
',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('Mo7dLc1soaJTwafnKr2q','watermelon-mo7d','watermelon','Refreshers','watermelon 
sugar  
ice
',9000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('N6DPXSbajqIMLrauXtkj','macchiato-n6dp','Macchiato','Coffee','Espresso with a light touch of foam',7000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('NV4sCbZ0g7uqMTF4eE1Z','ethiopian-coffee-nv4s','Ethiopian Coffee','Coffee','Ethiopian Specialty Coffee Beans
250g',70000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('QAPOeVUbS55NdgXMhud5','white-mocha-qapo','White Mocha','Coffee','White Mocha, espresso, milk, and a touch of bareeq✨',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('R2uO6wACAijBTeFLEwd3','blueberry-r2uo','Blueberry','Other','',3000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('R9YZi9q42Ej7Ec0vFSNk','salted-caramel-blend-r9yz','Salted Caramel Blend','Other','',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('RCZyp4UlF2lYX5XBYwFD','espresso-rczy','Espresso','Coffee','Specialty coffee
',6000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('ROaKm3HTVTwZMlodTUJF','nutella-croissant-roak','Nutella Croissant','Cakes & Sweets','Fresh butter croissants and Nutella
',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('RRFY5feGdhoXotQikWTi','medjool-date-latte-rrfy','Medjool Date Latte','Coffee','Majdool dates, espresso, fresh milk, and a hint of cinnamon ✨',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('SUBgPzKqXAXMK2IHMI9T','pink-lemonade-subg','Pink Lemonade 🍊','Other','Lemon, coconut milk, and strawberry.
',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('SXQvLvzJYgkqnMnAsdZc','bueno-hot-chocolate-sxqv','Bueno Hot Chocolate','Other','',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('SkluIVyvsfdYjnAOK04O','spanish-latte-sklu','Spanish Latte','Coffee','Condensed milk, espresso, milk, and a touch of bareeq✨',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('TC4seTLwIxzRwhFwzLNx','cortado-tc4s','Cortado','Coffee','Espresso + milk + a touch of foam',7000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('TkM4Oh7zdJg3rykAXBKT','mango-smoothie-tkm4','Mango smoothie','Refreshers','Mango smoothie
',9000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('Ttiu32Fsve6joxIy3X5H','sunshine-passion-fruit-ttiu','Sunshine Passion Fruit','Refreshers','Passion Fruit Soda',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('TvSzgElLaY73aMzhiO78','tropical-hibiscus-tvsz','tropical Hibiscus','Other','',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('VDeatSaWVqeaqwtlEg02','sunshine-peach-vdea','Sunshine Peach','Refreshers','Soda Fresh , lemon, mint, peach
',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('WQdQCHPJv4rZwzgvizd1','butter-croissant-wqdq','Butter Croissant','Cakes & Sweets','Butter croissants
',5000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('XHZz5AEf4X4shShL3Fvb','pistachio-xhzz','Pistachio','Other','',3500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('ZGVQGeWBrpykvSAzEBu9','iced-mocha-zgvq','Iced Mocha','Coffee','Chocolate, espresso, fresh milk, a touch ofmagic  bareeq  
',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('ZfQpa0D9WfMAS7NvuvuP','passion-fruit-smoothie-zfqp','Passion Fruit Smoothie','Refreshers','Tropical fruits with snow and a touch of glitter
',9000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('ZqrbA8ugh4EJMGRk6jww','japanese-cream-spanish-matcha-zqrb','Japanese Cream Spanish Matcha','Matcha','Japanese Matcha ',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('b5ifcgRp3wESpWZsiLco','caramel-b5if','Caramel','Other','',3000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('c87Zf1pze3d41oYIbUNm','japanese-iced-white-chocolate-matcha-c87z','Japanese Iced White Chocolate Matcha','Matcha','Japanese  Matcha',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('cTvQrTsop5teNt17h7JA','mint-lemonade-ctvq','Mint Lemonade','Refreshers','Lemonade, Mint .ice .Water. sugar
',7000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('crA1XSfPq7WD5r0RVW8o','latte-cra1','Latte','Coffee','fresh milk, espresso, and a touch of bareeq magic ✨',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('dtd44XxBp1rA7TBtqU1k','v60-dtd4','V60','Coffee','',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('duNIISSFJpAHD8xq0c3V','japanese-blueberry-matcha-cream-duni','Japanese Blueberry Matcha Cream','Matcha','Japanese Matcha ',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('fpNQqDUYJj0UUO7aM8OQ','mocha-fpnq','Mocha','Coffee','Chocolate, fresh milk, espresso, and a touch of bareeq✨',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('fqQZ3HLYZqRMd2fvcER4','salted-caramel-latte-fqqz','Salted Caramel Latte','Coffee','fresh milk, espresso, SALTED CARAMEL , and a touch of bareeq magic ✨',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('h1muP7yt5Ka4HhhGC7MG','iced-latte-h1mu','Iced Latte','Coffee','Fresh Milk, Espresso, Ice. A touch of bareeq.',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('huM6iCkhxXn1kssZVOxa','oat-milk-hum6','OAT milk','Other','',3000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('i40IUxpmWAyA8wltzXcn','original-cookie-i40i','Original Cookie','Cakes & Sweets','Original Cookie ',8500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('iNiIFLviKxvuDayA4gnO','sunshine-red-bull-inii','Sunshine  Red Bull ⚡🥤','Refreshers','',13000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('j4mSS3aPGYjJN1E1z7K8','pistachio-latte-j4ms','Pistachio Latte','Coffee','pistachio latte, fresh milk, espresso, and a touch of bareeq✨',13000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('jKhKOyS1nXox4FtJ3i3z','nutella-cookies-jkhk','Nutella Cookies','Cakes & Sweets','Nutella cookies 
',8500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('jiIFxXuHG0ucrxVOrwoS','americano-jiif','Americano','Coffee','Espresso + Hot water
',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('k2wh0G5MqdkWfYkvKoIa','water-k2wh','water','Refreshers','',1500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('kEIg4v2cHa97BZOS8v9t','iced-pistachio-latte-keig','Iced Pistachio Latte','Coffee','Pistachios, fresh milk, espresso
',13000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('kVAJlYGBdCx0RF72KLGZ','iced-caramel-macchiato-kvaj','Iced Caramel Macchiato','Coffee','Caramel sauce, fresh milk, espresso, vanilla, a touch of bareeq
',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('krWxJtGWKe00xly4S3Tx','coconut-milk-krwx','coconut milk','Other','',3000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('lawd3LqoTPELu09oCS9n','oreo-nutella-cream-lawd','Oreo Nutella Cream','Other','Oreo, Nutella ,vanilla Powder
',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('nO9E8pt768SS2ptpQJBs','strawberry-vanilla-cream-no9e','Strawberry Vanilla Cream','Other','Strawberry ,Vanilla,, vanilla powder, ice, whipped cream',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('olOCy3QMdJIT0AKGAkGN','lemon-passion-fruit-oloc','Lemon Passion Fruit','Refreshers','Lemon tropical fruits Water and a little sugar
',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('ph9umyY7PqADD8m1BYL6','iced-americano-ph9u','Iced Americano','Coffee','',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('qBjW47OlfPAz4uNl0cVV','japanese-coconut-matcha-blend-qbjw','Japanese Coconut Matcha Blend','Matcha','Coconut
Fresh milk
Japanese Matcha
',14000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('qvXborSi7lojm8F02iLy','milky-way-blend-qvxb','Milky Way Blend','Coffee','A blend of two premium coffee crops: Brazilian and Colombian.
',60000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('sLBtjwwDaZBXle2c4t2Y','grape-greek-slbt','Grape Greek','Other','Berries 
Greek yogurt
Fresh milk
A touch of bareeq
',13000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('snJ8nVicTaklIAi768Vc','japanese-cream-matcha-snj8','Japanese Cream Matcha','Matcha','Matcha. Fresh milk powder, vanilla, Japanese matcha herbs
',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('swrLEYfmUFPzxQe0a8W8','italian-tiramisu-swrl','Italian Tiramisu','Cakes & Sweets','Italian Tiramisu Creamy',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('tJOpyNAKMVlcjmsz2mzN','iced-shaken-white-mocha-tjop','Iced Shaken White Mocha','Coffee','White mocha, espresso, fresh milk, a magical bareeq
',11500,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('tgnF7TBD6RTX2AyTzhv2','san-sebastian-cheesecake-tgnf','San Sebastian Cheesecake','Cakes & Sweets','San Sebastian Roasted & Josie',9000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('uyQxMNNovpktA5RHafBq','fruity-ice-chocolate-uyqx','Fruity Ice Chocolate','Other','Fruity &Chocolate ',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('vE9NzqAwpkKkfhnzA6Oq','mocha-blend-ve9n','Mocha Blend','Other','Chocolate, fresh milk, espresso
',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('viResqTRryObYYUcgQ2n','flat-white-vire','Flat White','Coffee','Espresso + milk + a touch of foam',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('vklJoUZlo4a9r3jJKgvM','japanese-white-chocolate-matcha-blend-vklj','Japanese White Chocolate Matcha Blend','Matcha','matcha ,White Chocolate  ',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('vrMJak6GnQAACy7480mS','peanut-butter-blend-vrmj','Peanut Butter Blend','Other','',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('w5zB5iWpnOhu3J8uR78h','latte-blend-w5zb','Latte Blend','Other','Fresh milk, espresso powder, Villaella ice
 ',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('wPZUDUHf9UC97vEbpLy5','cappuccino-wpzu','Cappuccino','Coffee','fresh milk, espresso, and a touch of bareeq magic ✨',9000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('x76UKOm32wbXLuJUBISh','sunshine-lemon-mint-x76u','Sunshine Lemon Mint','Refreshers','Lemon Mint Soda',8000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('xHMvY5kYoDuOcohRuTms','blueberry-xhmv','Blueberry','Other','Blueberries, vanilla powder, ice, whipped cream
',10000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('y2duyU2Yd4j9Fx4oaWkh','matcha-salted-caramel-y2du','Matcha Salted Caramel','Matcha','',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('yy2Acd19rOraSfQBPNjC','blueberry-danish-yy2a','Blueberry Danish🫐','Cakes & Sweets','    Layers of buttery perfection, filled with silky vanilla cream and topped with fresh blueberries. 🫐🥐✨
* Not just a Danish… it’s a blueberry masterpiece. 💙. ',12000,true,null,false) on conflict(id) do nothing;
insert into public.products(id,slug,name,category_id,description,price_minor,available,image,illustrative) values('zLuM0fWqRQsm82xpw3UC','white-mocha-blend-zlum','White Mocha Blend','Other','White Chocolate Vanilla Milk Powder
espresso',12000,true,null,false) on conflict(id) do nothing;