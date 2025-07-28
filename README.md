# Trustana FE Take home assignment (Senior)

Please read the following instructions carefully first.

## Instructions

1. Clone the repository to your local machine.
2. Create a SUBMISSION.md file in the root of the repository. This SUBMISSION.md will be the file where you will describe your solution, issues, assumptions and other information.
3. You can use any AI tools to help you with the assignment.
4. If the data provided has incorrect or missing information, please fix it as you deem fit and include it under the section "Fixes" in your README.md.
5. If you made any assumptions, please include them under the section "Assumptions" in your README.md.
6. You can install any additional dependencies you may need, but you will need to explain your decisions in the SUBMISSION.md file.

## Introduction

Trustana is a product data platform that enable retailers to transform and manipulate their product efficiently according to their needs.

### Your Task

Your task is to create a web application that allows users to view, search and perform complex filters on product data. As a user, I want to quickly filter products, create custom views, save filters and share them with my team.

You have a list of mock apis that you can use to get the data you need. As these are mock apis, you can skip the Create / Update / Delete operations.

- /api/products
- /api/attributes

### Non-negotiables

1. You must use TypeScript.
2. You must use React.
3. You must use Next.js + App router
4. You must use the provided mock APIs.
5. You must use the provided types.
6. You must use the provided enums.

### Product requirements

- Fast render times
- Shareable filters
- Default page: 100
- Max attribute per supplier: 100

### Usage of AI

Feel free to use any AI tools to help you with the assignment. However, you will be expected to explain your solution during the followup interview.

## FAQ

1. Why are there weird fields present in the mock JSON but are not present in the types?

- To simplify the assignment, we have removed some fields that are not relevant to the task, only focus on the fields that are present in the types provided.

2. I think I found some issues with the mock data / apis provided.

- Please fix the issues to the best of your ability and include it under the section "Fixes" in your README.md.

3. I have some questions related to the user experience and the UI.

- If you cannot get answers to your questions in time, please state your assumptions, continue with the assignment and include it under the section "Assumptions" in your README.md.
