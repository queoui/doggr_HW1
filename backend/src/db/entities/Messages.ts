import {Entity, Property, ManyToOne} from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import {BaseEntity} from "./BaseEntity.js";
import { User } from "./User.js";

@Entity()
export class Message extends BaseEntity{
	
	
	@ManyToOne({onUpdateIntegrity: 'set null', onDelete:'cascade'})
	sender_user!: Rel<User>;
	
	@ManyToOne({onUpdateIntegrity: 'set null', onDelete:'cascade'})
	receiver_user!: Rel <User>;
	
	@Property()
	message!: string;
	
}
