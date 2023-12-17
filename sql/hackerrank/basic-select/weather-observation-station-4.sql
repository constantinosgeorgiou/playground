/*
 Enter your query here.
 */
SELECT COUNT(s.CITY) - COUNT(DISTINCT s.CITY)
FROM STATION s;