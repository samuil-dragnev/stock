namespace Project.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class UpdateUserFriends : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Friends",
                c => new
                    {
                        FriendsId = c.Int(nullable: false, identity: true),
                        FirstUserId = c.String(maxLength: 128),
                        SecondUserId = c.String(maxLength: 128),
                        ApplicationUser_Id = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.FriendsId)
                .ForeignKey("dbo.AspNetUsers", t => t.FirstUserId)
                .ForeignKey("dbo.AspNetUsers", t => t.SecondUserId)
                .ForeignKey("dbo.AspNetUsers", t => t.ApplicationUser_Id)
                .Index(t => t.FirstUserId)
                .Index(t => t.SecondUserId)
                .Index(t => t.ApplicationUser_Id);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Friends", "ApplicationUser_Id", "dbo.AspNetUsers");
            DropForeignKey("dbo.Friends", "SecondUserId", "dbo.AspNetUsers");
            DropForeignKey("dbo.Friends", "FirstUserId", "dbo.AspNetUsers");
            DropIndex("dbo.Friends", new[] { "ApplicationUser_Id" });
            DropIndex("dbo.Friends", new[] { "SecondUserId" });
            DropIndex("dbo.Friends", new[] { "FirstUserId" });
            DropTable("dbo.Friends");
        }
    }
}
