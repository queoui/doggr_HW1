import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { Match } from "./db/entities/Match.js";
import {Message} from "./db/entities/Messages.js";
import {User} from "./db/entities/User.js";
import {ICreateUsersBody} from "./types.js";
import fs from 'fs';

async function DoggrRoutes(app: FastifyInstance, _options = {}) {
	if (!app) {
		throw new Error("Fastify instance has no value during routes construction");
	}
	
	app.get('/hello', async (request: FastifyRequest, reply: FastifyReply) => {
		return 'hello';
	});
	
	app.get("/dbTest", async (request: FastifyRequest, reply: FastifyReply) => {
		return request.em.find(User, {});
	});
	

	
	// Core method for adding generic SEARCH http method
	// app.route<{Body: { email: string}}>({
	// 	method: "SEARCH",
	// 	url: "/users",
	//
	// 	handler: async(req, reply) => {
	// 		const { email } = req.body;
	//
	// 		try {
	// 			const theUser = await req.em.findOne(User, { email });
	// 			console.log(theUser);
	// 			reply.send(theUser);
	// 		} catch (err) {
	// 			console.error(err);
	// 			reply.status(500).send(err);
	// 		}
	// 	}
	// });
	
	// CRUD
	// C
	app.post<{Body: ICreateUsersBody}>("/users", async (req, reply) => {
		const { name, email, petType} = req.body;
		
		try {
			const newUser = await req.em.create(User, {
				name,
				email,
				petType
			});

			await req.em.flush();
			
			console.log("Created new user:", newUser);
			return reply.send(newUser);
		} catch (err) {
			console.log("Failed to create new user", err.message);
			return reply.status(500).send({message: err.message});
		}
	});
	
	//READ
	app.search("/users", async (req, reply) => {
		const { email } = req.body;
		
		try {
			const theUser = await req.em.findOne(User, { email });
			console.log(theUser);
			reply.send(theUser);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});
	
	// UPDATE
	app.put<{Body: ICreateUsersBody}>("/users", async(req, reply) => {
		const { name, email, petType} = req.body;
		
		const userToChange = await req.em.findOne(User, {email});
		userToChange.name = name;
		userToChange.petType = petType;
		
		// Reminder -- this is how we persist our JS object changes to the database itself
		await req.em.flush();
		console.log(userToChange);
		reply.send(userToChange);
		
	});
	
	// DELETE
	app.delete<{ Body: {email, admin, pass}}>("/users", async(req, reply) => {
		const { email, admin, pass } = req.body;
		
		try {
			if(admin !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS){
				throw new Error();
			}
		}catch(err){
			console.error(err);
			reply.status(401).send(err);
			return;
		}
		
		try {
			const theUser = await req.em.findOne(User, { email });
			
			await req.em.remove(theUser).flush();
			console.log(theUser);
			reply.send(theUser);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});

	// CREATE MATCH ROUTE
	app.post<{Body: { email: string, matchee_email: string }}>("/match", async (req, reply) => {
		const { email, matchee_email } = req.body;

		try {
			// make sure that the matchee exists & get their user account
			const matchee = await req.em.findOne(User, { email: matchee_email });
			// do the same for the matcher/owner
			const owner = await req.em.findOne(User, { email });

			//create a new match between them
			const newMatch = await req.em.create(Match, {
				owner,
				matchee
			});

			//persist it to the database
			await req.em.flush();
			// send the match back to the user
			return reply.send(newMatch);
		} catch (err) {
			console.error(err);
			return reply.status(500).send(err);
		}

	});
	
	
	app.post<{Body: { sender: string, receiver:string , message: string }}>("/messages", async (req, reply) => {
		const { sender, receiver, message} = req.body;
		// read the file as a string
		const data = fs.readFileSync( '/home/d/workspace/doggr_HW1/backend/src/badwords.txt', 'utf-8');
		
		// split the string by newlines to get an array of lines
		const lines = data.split('\r\n');
		
		try{
			for (const substring of lines) {
				if (message.includes(substring)) {
					throw new Error();
				}
			}

		}catch(err){
			console.error(err);
			return reply.status(500).send("tsk tsk! naughty naughty! someone has a potty mouth!");
		}
		
		try {
			// make sure that the matchee exists & get their user account
			const receiver_user = await req.em.findOne(User, { email: receiver });
			// do the same for the matcher/owner
			const sender_user = await req.em.findOne(User, { email: sender });
			
			//create a new match between them
			const newMessage = await req.em.create(Message, {
				sender_user,
				receiver_user,
				message
			});
			
			//persist it to the database
			await req.em.flush();
			// send the match back to the user
			return reply.send(newMessage);
		} catch (err) {
			console.error(err);
			return reply.status(500).send(err);
		}
		
	});
	
	app.search("/messages", async (req, reply) => {
		const { email } = req.body;
		
		try {
			const findUser = await req.em.findOne(User, { email });
			const allMessages = await req.em.find(Message, {receiver_user_id: findUser.id});
			reply.send(allMessages);
			
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});
	
	app.search("/messages/sent", async (req, reply) => {
		const { email } = req.body;
		
		try {
			const findUser = await req.em.findOne(User, { email });
			const allMessages = await req.em.find(Message, {sender_user_id: findUser.id});
			reply.send(allMessages);
			
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});
	
	app.put<{Body: {messageId: string, message: string}}>("/messages", async(req, reply) => {
		const { messageId , message} = req.body;
		
		const messageToChange = await req.em.findOne(Message, {id: Number(messageId)});
		messageToChange.message = message;
		
		await req.em.flush();
		console.log(messageToChange);
		reply.send(messageToChange);
		
	});
	
	app.delete<{ Body: {messageId: string, admin: string, pass: string}}>("/messages", async(req, reply) => {
		const { messageId, admin, pass} = req.body;
		
		try {
			if(admin !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS){
				throw new Error();
			}
		}catch(err){
			console.error(err);
			reply.status(401).send(err);
			return;
		}
		
		try {
			const MessageToDelete = await req.em.findOne(Message, { id: Number(messageId) });
			
			await req.em.remove(MessageToDelete).flush();
			console.log(MessageToDelete);
			reply.send(MessageToDelete);
		} catch (err) {
			console.error(err);
			reply.status(500).send(err);
		}
	});
	
	app.delete<{ Body: {email: string, admin:string, pass:string}}>("/messages/all", async(req, reply) => {
		const { email, admin, pass } = req.body;
		
		try {
			if(admin !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS){
				throw new Error();
			}
		}catch(err){
			console.error(err);
			reply.status(401).send(err);
			return;
		}
		
		try {
			const findUser = await req.em.findOne(User, { email });
			const MessageToDelete = await req.em.find(Message, {sender_user: findUser});
			
			await req.em.remove(MessageToDelete).flush();
			console.log(MessageToDelete);
			reply.send(MessageToDelete);
		} catch (err) {
			console.error(err);
			
			reply.status(500).send(err);
		}
	});
	
	
	
}

export default DoggrRoutes;
