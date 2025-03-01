import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { HasManyGetAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';
import Course from './Course.model';
import Lecture from './Lecture.model';
import Question from './Question.model';

@Table({
  tableName: 'quizzes',
  timestamps: true,
  paranoid: true
})
export default class Quiz extends Model<Quiz> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @ForeignKey(() => Course)
  @Column(DataType.UUID)
  courseId?: string;

  @BelongsTo(() => Course)
  course?: Course;

  @ForeignKey(() => Lecture)
  @Column(DataType.UUID)
  lectureId?: string;

  @BelongsTo(() => Lecture)
  lecture?: Lecture;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isActive!: boolean;

  @HasMany(() => Question)
  questions!: Question[];

  @Column(DataType.DATE)
  deletedAt?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  passingScore!: number;

  public getQuestions!: HasManyGetAssociationsMixin<Question>;

  public createQuestion!: HasManyCreateAssociationMixin<Question>;

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public async getTotalPoints(): Promise<number> {
    const questions = await this.getQuestions();
    return questions.reduce((sum, question) => sum + question.points, 0);
  }

  public isPassing(score: number, totalPoints: number): boolean {
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    return percentage >= this.passingScore;
  }
}