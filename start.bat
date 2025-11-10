@echo off
echo Starting Civic Hub Project...

echo.
echo Installing dependencies...
call npm install
cd server
call npm install
cd ..

echo.
echo Seeding database with sample data...
cd server
call npm run seed
echo.
echo Starting backend server...
start cmd /k "npm start"
cd ..

echo.
echo Starting frontend server...
timeout /t 3 /nobreak > nul
call npm run dev