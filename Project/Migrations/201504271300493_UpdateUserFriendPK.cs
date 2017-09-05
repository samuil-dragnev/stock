namespace Project.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class UpdateUserFriendPK : DbMigration
    {
        public override void Up()
        {
            DropIndex("dbo.Friends", new[] { "FirstUserId" });
            DropPrimaryKey("dbo.Friends");
            AddColumn("dbo.Friends", "FriendsId", c => c.Int(nullable: false, identity: true));
            AlterColumn("dbo.Friends", "FirstUserId", c => c.String(maxLength: 128));
            AddPrimaryKey("dbo.Friends", "FriendsId");
            CreateIndex("dbo.Friends", "FirstUserId");
        }
        
        public override void Down()
        {
            DropIndex("dbo.Friends", new[] { "FirstUserId" });
            DropPrimaryKey("dbo.Friends");
            AlterColumn("dbo.Friends", "FirstUserId", c => c.String(nullable: false, maxLength: 128));
            DropColumn("dbo.Friends", "FriendsId");
            AddPrimaryKey("dbo.Friends", "FirstUserId");
            CreateIndex("dbo.Friends", "FirstUserId");
        }
    }
}
