const Log = require('./common/Log');
const bcrypt = require('bcrypt');
const data = require('./data');
const usersDB = data.users;
const inventoryDB = data.inventory;

const TAG = 'seeder';

const users = [
	{
		email: 'test@globalfru.it',
		name: 'Test Shopowner',
		hashedPassword: async () => {
			return await bcrypt.hash('test', 4);
		},
		shopowner: true
	},{
		email: 'test@test.test',
		name: 'Test Shopper',
		hashedPassword: async () => {
			return await bcrypt.hash('test', 4);
		},
		shopowner: false
	}
];
const inv = [
	{
		item: {
			name: 'Pineapple',
			price: 10
		},
		count: 4,
	},{
		item: {
			name: 'Banana',
			price: 3
		},
		count: 2,
	},{
		item: {
			name: 'Avocado',
			price: 20
		},
		count: 6,
	}

];

const comments = [
	'This is a comment',
	'This is another comment',
];

async function parseUsers() {
	Log.d(TAG, 'hashing test user passwords');
	for (const u in users) {
		users[u].hashedPassword = await users[u].hashedPassword();
	}
	return;
}

async function addUsers() {
	Log.d(TAG, 'Seeding database with users');
	for (const i in users) {
		Log.d(JSON.stringify(users[i], null, 2));
		users[i] = await usersDB.addUser(users[i]);
	}	
}

async function addInventory() {
	Log.d(TAG, 'Seeding database with inventory');
	for (const i in inv) {
		inv[i] = await inventoryDB.addItem({
			...inv,
			seller: users.find(n => n.shopowner),
		});
	}
}

async function addComments() {
	Log.d(TAG, 'Seeding database with comments');
	for (const c of comments) {
		const rItem = inv[Math.floor(Math.random() * inv.length)];
		const rUser = users[Math.floor(Math.random() * users.length)];
		await inventoryDB.addComment(rItem._id, {
			poster: rUser,
			comment: c,
			rating: Math.floor(Math.random() * 6),
			timestamp: new Date(),
		});
	}
}

async function addCarts() {
	Log.d(TAG, "Seeding database with carts");
	for (const u of users) {
		const nPurchases = 2;
		for (let i = 0; i < nPurchases; i++) {
			const item = items[Math.floor(Math.random() * items.length)];
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
			const item = items[Math.floor(Math.random() * items.length)];
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
		await parseUsers();
		await addUsers();
		await addInventory();
		await addComments();
		await addCarts();
		await addPurchases();
	} catch (e) {
		Log.d(TAG, e);
	}
}

run();
