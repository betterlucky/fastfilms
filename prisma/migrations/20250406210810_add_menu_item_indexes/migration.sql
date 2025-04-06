-- DropForeignKey
ALTER TABLE "MenuItemOption" DROP CONSTRAINT "MenuItemOption_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItemOptionChoice" DROP CONSTRAINT "MenuItemOptionChoice_optionId_fkey";

-- CreateIndex
CREATE INDEX "MenuItem_category_idx" ON "MenuItem"("category");

-- CreateIndex
CREATE INDEX "MenuItemOption_menuItemId_idx" ON "MenuItemOption"("menuItemId");

-- CreateIndex
CREATE INDEX "MenuItemOptionChoice_optionId_idx" ON "MenuItemOptionChoice"("optionId");

-- AddForeignKey
ALTER TABLE "MenuItemOption" ADD CONSTRAINT "MenuItemOption_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemOptionChoice" ADD CONSTRAINT "MenuItemOptionChoice_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "MenuItemOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
