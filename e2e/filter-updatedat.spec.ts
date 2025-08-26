import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Add Filter" }).click();
  await page.getByRole("button", { name: "Select field..." }).click();
  await page
    .locator("#radix-_r_5_")
    .getByRole("button", { name: "Updated At" })
    .click();
  await page.getByRole("button", { name: "≠ not equals" }).click();
  await page.getByRole("textbox", { name: "Enter a value" }).click();
  await page
    .getByRole("textbox", { name: "Enter a value" })
    .fill("1736996973197");
  await page.getByRole("button", { name: "Apply Filter" }).click();
  await page
    .getByRole("cell", { name: "Updated At" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("cell", { name: "1738840446797" })).toBeVisible();
});
