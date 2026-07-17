import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Post } from './Post';

@Table({
  tableName: 'categories',
  timestamps: true,
  underscored: true
})
export class Category extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  slug!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  icon!: string;

  @Column({
    type: DataType.ENUM('active', 'disabled'),
    defaultValue: 'active',
    allowNull: false
  })
  status!: 'active' | 'disabled';

  @HasMany(() => Post)
  posts!: Post[];
}
