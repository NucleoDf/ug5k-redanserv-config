
@echo off
if "" == "%1" goto errorInstallation

:menu
cls
echo ****************************************************************
echo **** Utilidad de instalacion y actualizacion Ulises 5000-G  ****
echo ****************************************************************
echo.
echo.
echo Seleccione la opcion
echo 	A: Actualizacion
echo 	I: Instalacion
echo 	C: Crear tabla incidencias 
echo		S: Salir
echo.
choice /C AICS /M "Pulse (A), (I), (C) o (S)" 
SET opcion=%errorlevel%

if errorlevel 4 goto fin
if errorlevel 3 goto install-incidencias
if errorlevel 2 goto install-ug5k
if errorlevel 1 goto update-ug5k
goto menu

:install-ug5k
md %1

md %1\bin
xcopy .\bin %1\bin /SY

md %1\.idea
xcopy .\.idea %1\.idea /SY

md %1\node_modules
xcopy .\node_modules %1\node_modules /SY

md %1\routes
xcopy .\routes %1\routes /SY

md %1\lib
xcopy  .\lib %1\lib /SY

md %1\views
xcopy .\views %1\views /SY

md %1\data_model
xcopy .\data_model %1\data_model /SY

md %1\public
xcopy .\public %1\public /SY

copy *.json %1
copy app.js %1
copy *.bat %1
copy *.txt %1

goto installService

:update-ug5k
md %1\routes
xcopy .\routes %1\routes /SY

md %1\lib
xcopy  .\lib %1\lib /SY

md %1\views
xcopy .\views %1\views /SY

md %1\data_model
xcopy .\data_model %1\data_model /SY


md %1\public
md %1\public\images
md %1\public\javascripts
md %1\public\lang
md %1\public\pdfmake
md %1\public\stylesheets
md %1\public\translator

xcopy .\public\images %1\public\images /SY
xcopy .\public\javascripts %1\public\javascripts /SY
xcopy .\public\lang %1\public\lang /SY
xcopy .\public\pdfmake %1\public\pdfmake /SY
xcopy .\public\stylesheets %1\public\stylesheets /SY
xcopy .\public\translator %1\public\translator /SY

copy *.json %1
copy app.js %1
copy *.bat %1
copy *.txt %1
goto installService

:installService
cls
echo *************************************************
echo **** Crear servicio Ulises G5000  (32/64 bits) ****
echo *************************************************
echo.
echo.
choice /C SN /M "Crear el servicio Ulises G5000 ? (S)i (N)o" 
SET instala=%errorlevel%
if errorlevel 2 goto fin
if errorlevel 1 goto instala-service
goto installService

:instala-service
reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT
if %OS%==32BIT echo This is a 32bit operating system
if %OS%==64BIT echo This is a 64bit operating system

if %OS%==32BIT copy .\nss\win32\nssm.exe %1
if %OS%==64BIT copy .\nss\win64\nssm.exe %1

%1\nssm.exe install Ulises-G5000

goto fin

:install-incidencias
rem "C:\Program Files\MySQL\MySQL Server 5.6\bin\mysql.exe" --host=localhost --user=root --password="U5K-G"  < "C:\\UG5K-Serv\\data_model\\BD_UG5K_New_Installation.sql"
mysql.exe --host=localhost --user=root --password="U5K-G"  <  %1\data_model\BD_UG5K_New_Installation.sql

@echo "Actualizacion de las tablas de incidencias finalizada."
pause
goto fin

:installService

goto fin

:errorInstallation
@echo restore drive:install_path_UG5K-SERV

:fin
@echo Fin de la instalacion
pause
