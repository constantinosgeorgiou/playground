/*
 Enter your query here.
 */
SELECT DISTINCT s.CITY
FROM STATION s
WHERE (s.ID % 2) = 0