namespace Project.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class UpdateUserFriendKey : DbMigration
    {
        public override void Up()
        {
            DropIndex("dbo.Friends", new[] { "FirstUserId" });
            DropPrimaryKey("dbo.Friends");
            AlterColumn("dbo.Friends", "FirstUserId", c => c.String(nullable: false, maxLength: 128));
            AddPrimaryKey("dbo.Friends", "FirstUserId");
            CreateIndex("dbo.Friends", "FirstUserId");
            DropColumn("dbo.Friends", "FriendsId");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Friends", "FriendsId", c => c.Int(nullable: false, identity: true));
            DropIndex("dbo.Friends", new[] { "FirstUserId" });
            DropPrimaryKey("dbo.Friends");
            AlterColumn("dbo.Friends", "FirstUserId", c => c.String(maxLength: 128));
            AddPrimaryKey("dbo.Friends", "FriendsId");
            CreateIndex("dbo.Friends", "FirstUserId");
        }
    }
}
