import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({
    nullable: false,
  })
  id: string;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({
    nullable: false,
    default: 'phone',
  })
  id_type: string;
}
