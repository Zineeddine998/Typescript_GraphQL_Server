import { Migration } from '@mikro-orm/migrations';

export class Migration20200830001501 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop column "title";');
  }

}
