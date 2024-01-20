SELECT IF(Grades.Grade < 8, 'NULL', Students.Name),
    Grades.Grade,
    Students.Marks
FROM Students
    INNER JOIN Grades ON (
        Students.Marks >= Grades.Min_Mark
        AND Students.Marks <= Grades.Max_Mark
    )
ORDER BY Grades.Grade DESC,
    Students.Name ASC,
    Students.Marks ASC