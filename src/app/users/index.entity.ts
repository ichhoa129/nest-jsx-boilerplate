import { Role } from "@app/roles/index.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { genSalt, hash } from "bcrypt";
import { BaseEntityChild } from "@app/Template/Base/Entity/index.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User extends BaseEntityChild {
  @ApiProperty({ readOnly: true })
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number

  @ApiProperty({ example: 'Name' })
  @Column({
    type: 'varchar',
    length: 255
  })
  name: string

  @ApiProperty({ example: '0123456789' })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  phone: string
  
  @ApiProperty({ example: 'email@email.com' })
  @Column({
    type: 'varchar',
    length: 255,
    unique: true
  })
  email: string
  
  @ApiProperty({ example: 'password' })
  @Column({
    type: 'varchar',
    length: 255,
  })
  password: string
  
  @ApiPropertyOptional({ example: 'address' })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  address: string

  @ApiPropertyOptional({ example: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRlUbAyS_643dq_B69jZAlPNW6_Xc7SLELY6SpRsc5OI2wHiiYG&usqp=CAU' })
  @Column({
    type: 'varchar',
    nullable: true
  })
  avatar: string

  @ApiProperty({ example: 'Very handsome man' })
  @Column({
    type: 'text',
    nullable: true
  })
  bio: string
  
  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' }
  })
  roles: Role[]
  
  /**
   * Trigger
   */
  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    const userRepository = await User.getRepository()
    const dbCurrentUser = await userRepository.findOne(this.id)
    if (this.password !== dbCurrentUser?.password)
      this.password = await hash(this.password, await genSalt())
  }
}
