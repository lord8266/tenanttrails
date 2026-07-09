# TenantTrails API

## Gitlab Link

https://git.cs.dal.ca/pravin/tenanttrails

## APIs Created

Added APIs for
* Signup login using email/password and returning a JWT
* Getting apartment with review counts
* Getting apartment details using id
* Creating an apartment, takes in a list of attachments which are urls to cloudinary, the first image in that will be used as the thumbnail for the apartment.
* Creating a review for an apartment, takes in a list of attachments as well.
Upload endpoint for uploading attachments, it returns the cloudinary link
* Editing reviews
* Deleting review
* Getting user info with reviews.

## Attachments

A single `attachment` table holds both apartment and review attachments. Each
row carries `url` and `type` plus two nullable foreign keys, `apartment_id` and
`review_id`; exactly one is set per row (enforced by a CHECK constraint), and
both cascade on delete. This keeps the 1:N relationship while avoiding a
separate table per parent. See `migrations/combine_attachments.sql` for the
schema and the migration from the old per-parent tables.

Example attachment:
```
mysql> select * from attachment;
+----+--------------+-----------+-----------------------------------------------------------------------------------------------------+------------+------------+
| id | apartment_id | review_id | url                                                                                                 | type       | created    |
+----+--------------+-----------+-----------------------------------------------------------------------------------------------------+------------+------------+
|  1 |            9 |      NULL | https://res.cloudinary.com/dcueyjhlz/image/upload/v1781815104/tenanttrails/polc43ch5uqbomsidcrt.jpg | image/jpeg | 2026-06-18 |
|  2 |         NULL |        13 | https://res.cloudinary.com/dcueyjhlz/image/upload/v1781815104/tenanttrails/polc43ch5uqbomsidcrt.jpg | image/jpeg | 2026-06-18 |
+----+--------------+-----------+-----------------------------------------------------------------------------------------------------+------------+------------+
```

## Postman Collection

Added the postman collection to the repo: postman_collection.json
The screenshots for each request are in screenshots folder.

## Tests

Added tests for all the 7 requests which were in the postman collection. It creates user/apt/review and then deletes them.
