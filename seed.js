const Log = require('./common/Log');
const data = require('./data');
const usersDB = data.users;
const inventoryDB = data.inventory;
const {clearAll} = require("./mongo/collections");
const fs = require('fs');
const path = require('path');

const TAG = 'seeder';

const users = [
	{
		email: 'test@globalfru.it',
		name: 'Test Shopowner',
		hashedPassword: "$2b$04$kak5ZfyvfKD.Rzt5Ziko0eCytCWhWsmpxygA3.5Xu8EXV4pZ1J24G",
		shopowner: true
	},{
		email: 'test@test.test',
		name: 'Test Shopper',
		hashedPassword: "$2b$04$qfYWNd10Ppv6Y4WylYeIfOJ7w/ivgr2IdnZekvu4L7gh3KLzByxPS",
		shopowner: false
	}
];
const inv = [
	{
		item: {
			name: 'Pineapple',
			price: 10
		},
		count: 40,
		img: 'pineapples.png',
	},
	{
		item: {
			name: 'Banana',
			price: 3
		},
		count: 72,
		img: 'bananas.png',
	},{
		item: {
			name: 'Avocado',
			price: 20
		},
		count: 16,
		img: 'avocados.jpg',
	},{
		item: {
			name: 'Apple',
			price: 1
		},
		count: 57,
		img: 'apples.png',
	},{
		item: {
			name: 'Tomato',
			price: 2
		},
		count: 12,
		img: 'tomatoes.jpg',
	}

];

const comments = [
	'This is a comment',
	'This is another comment',
	'This is a third comment',
	'This is a fourth comment',
	'This is a fifth comment',
	'This is a sixth comment',
];

async function addUsers() {
	Log.d(TAG, 'Seeding database with users');
	for (const i in users) {
		users[i] = await usersDB.addUser(users[i]);
		//Log.d(JSON.stringify(users[i], null, 2));
	}
}

async function addInventory() {
	Log.d(TAG, 'Seeding database with inventory');
	for (const i in inv) {
		//Log.d(JSON.stringify(inv[i].item, null, 2));
		//Log.d(JSON.stringify(users.find(n => n.profile.shopowner), null, 2));
		const imgPath = path.join(__dirname, 'fruitpics', inv[i].img)
		const data = fs.readFileSync(imgPath);
		inv[i] = await inventoryDB.addItem({
			item: inv[i].item,
			count: inv[i].count,
			seller: users.find(n => n.profile.shopowner).profile,
		});
		if (data) {
			fs.writeFileSync(`./upload/${inv[i]._id}.${imgPath.split('.').reverse()[0]}`, data, null);
		}
	}
}

async function addComments() {
	Log.d(TAG, 'Seeding database with comments');
	for (const c of comments) {
		const rItem = inv[Math.floor(Math.random() * inv.length)];
		const rUser = users[Math.floor(Math.random() * users.length)].profile;
		await inventoryDB.addComment({
			id: rItem._id,
			comment: {
				poster: rUser,
				comment: c,
				rating: Math.floor(Math.random() * 6),
				timestamp: new Date(),
			}
		});
	}
}

async function addCarts() {
	Log.d(TAG, "Seeding database with carts");
	for (const u of users) {
		const nPurchases = 2;
		for (let i = 0; i < nPurchases; i++) {
			const item = inv[Math.floor(Math.random() * inv.length)].item;
			//Log.d(JSON.stringify(item, null, 2));
			await usersDB.addToCart({
				id: u._id,
				item,
			});
		}
	}
}

async function addPurchases() {
	Log.d(TAG, "Seeding database with purchases");
	for (const u of users) {
		const nPurchases = 2;
		for (let i = 0; i < nPurchases; i++) {
			const item = inv[Math.floor(Math.random() * inv.length)].item;
			await usersDB.addToHistory({
				id: u._id,
				item,
				price: +((Math.random() * 30).toFixed(2)),
			});
		}
	}
}

async function run() {
	try {
		Log.d(TAG, 'start');
		await clearAll();

		await addUsers();
		await addInventory();
		await addComments();
		await addCarts();
		await addPurchases();
		Log.d(TAG, 'done');
		process.exit(0);
	} catch (e) {
		Log.d(TAG, e);
		process.exit(1);
	}
}

run();
