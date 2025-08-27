import { test, expect } from "@playwright/test";

test("should filter by updated at", async ({ page }) => {
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

test("should be able to get info from search params", async ({ page }) => {
  await page.goto(
    "http://localhost:3000/?limit=10&page=1&filter=base%3AcreatedAt%3Aeq%3A1753762440651&filter=base%3AupdatedAt%3Aeq%3A1753767173167",
  );
  await expect(page.getByRole("cell", { name: "1753767173167" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "1753762440651" })).toBeVisible();
});

test("should be able to change limit", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "10", exact: true }).click();
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - text: /\\d+ results/
    - paragraph: Rows per page
    - combobox: /\\d+/
    - text: /Page 1 of \\d+/
    - button "Go to first page" [disabled]
    - button "Go to previous page" [disabled]
    - button "Go to next page"
    - button "Go to last page"
    `);

  await expect(page).toHaveURL("http://localhost:3000/?limit=10&page=1");
});

test("should be able to go to next page", async ({ page }) => {
  await page.goto("http://localhost:3000/?limit=10&page=1");
  await page.getByRole("button", { name: "Go to next page" }).click();
  await expect(page.getByRole("main")).toMatchAriaSnapshot(`
    - text: /\\d+ results/
    - paragraph: Rows per page
    - combobox: /\\d+/
    - text: /Page 2 of \\d+/
    - button "Go to first page"
    - button "Go to previous page"
    - button "Go to next page"
    - button "Go to last page"
    `);
  await expect(page).toHaveURL("http://localhost:3000/?limit=10&page=2");
});

test("filter by attribute key", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Add Filter" }).click();
  await page.getByRole("button", { name: "Select field..." }).click();
  await page.getByRole("button", { name: "Attributes" }).click();
  await page
    .getByRole("combobox")
    .filter({ hasText: "Search attributes..." })
    .click();
  await page.getByPlaceholder("Search attributes...").fill("name");
  await page.getByRole("option", { name: "Product Name name" }).click();
  await page.getByRole("button", { name: "* regex" }).click();
  await page.getByRole("textbox", { name: "Enter a value" }).click();
  await page.getByRole("textbox", { name: "Enter a value" }).fill("milk tea");
  await page.getByRole("button", { name: "Apply Filter" }).click();
  await expect(page.getByRole("cell", { name: "TR08192591" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "TR08192590" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Xiang Piao Piao milk tea" }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "XiangPiaoPiao Milk Tea-Dasheen" }).first(),
  ).toBeVisible();
  await expect(page).toHaveURL(
    "http://localhost:3000/?filter=attribute%3Aname%3Aregex%3Amilk%2520tea",
  );
});
