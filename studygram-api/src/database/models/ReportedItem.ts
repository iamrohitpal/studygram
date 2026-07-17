import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'reported_items',
  timestamps: true,
  underscored: true
})
export class ReportedItem extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  targetId!: number;

  @Column({
    type: DataType.ENUM('content', 'user'),
    allowNull: false
  })
  targetType!: 'content' | 'user';

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  reportedById!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  reason!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  evidence!: string;

  @Column({
    type: DataType.ENUM('pending', 'resolved', 'dismissed'),
    defaultValue: 'pending',
    allowNull: false
  })
  status!: 'pending' | 'resolved' | 'dismissed';

  @BelongsTo(() => User)
  reportedBy!: User;
}
