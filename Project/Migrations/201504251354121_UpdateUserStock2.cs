namespace Project.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class UpdateUserStock2 : DbMigration
    {
        public override void Up()
        {
            RenameColumn(table: "dbo.Stocks", name: "ApplicationUser_Id", newName: "AspNetUserId");
            RenameIndex(table: "dbo.Stocks", name: "IX_ApplicationUser_Id", newName: "IX_AspNetUserId");
        }
        
        public override void Down()
        {
            RenameIndex(table: "dbo.Stocks", name: "IX_AspNetUserId", newName: "IX_ApplicationUser_Id");
            RenameColumn(table: "dbo.Stocks", name: "AspNetUserId", newName: "ApplicationUser_Id");
        }
    }
}
