import {Entity, Property, ManyToOne} from "@mikro-orm/core";
import type { Rel } from "@mikro-orm/core";
import {BaseEntity} from "./BaseEntity.js";
import { User } from "./User.js";

@Entity()
export class Message extends BaseEntity{
	
	@ManyToOne()
	sender_user!: Rel<User>;
	
	@ManyToOne()
	receiver_user!: Rel <User>;
	
	@Property()
	message!: string;
	
}
