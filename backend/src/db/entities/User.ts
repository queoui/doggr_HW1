import { Entity, Property, Unique, OneToMany, Collection, Cascade } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity.js";
import { Match } from "./Match.js";
import {Message} from "./Messages.js";

@Entity({ tableName: "users"})
export class User extends BaseEntity {	
	@Property()
	@Unique()
	email!: string;
	
	@Property()
	name!: string;
	
	@Property()
	petType!: string;

	// Note that these DO NOT EXIST in the database itself!
	@OneToMany(
		() => Match,
		match => match.owner,
		{cascade: [Cascade.PERSIST, Cascade.REMOVE]}
	)
	matches!: Collection<Match>;

	@OneToMany(
		() => Match,
		match => match.matchee,
		{cascade: [Cascade.PERSIST, Cascade.REMOVE]}
	)
	matched_by!: Collection<Match>;
	
	@OneToMany(
		() => Message,
		message => message.sender_user,
		{cascade: [Cascade.PERSIST, Cascade.REMOVE]}
	)
	sent_messages!: Collection<Message>;
	
	@OneToMany(
		() => Message,
		message => message.receiver_user,
		{cascade: [Cascade.PERSIST, Cascade.REMOVE]}
	)
	received_messages!: Collection<Message>;
	
	
	
}
