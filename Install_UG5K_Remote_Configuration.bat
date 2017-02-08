﻿
@echo off
if "" == "%1" goto errorInstallation

:menu
cls
echo ****************************************************************
echo **** Utilidad de instalación y actualización Ulises 5000-G  ****
echo ****************************************************************
echo.
echo.
echo Seleccione la opción
echo Actualización				(A)
echo Instalación				(I)
echo Crear tabla incidencias 	(C)
echo Salir						(S)
echo.
choice /C AICS /M "Pulse (A), (I), (C) o (S)" 
SET opcion=%errorlevel%

if errorlevel 4 goto fin
if errorlevel 3 goto install-incidencias
if errorlevel 2 goto install-ug5k
if errorlevel 1 goto update-ug5k
goto menu

:install-ug5k
md %1\.idea
xcopy .\bin %1\bin /SY

md %1\bin
xcopy .\.idea %1\.idea /SY

md %1\node_modules
xcopy .\node_modules %1\node_modules /SY

md %1\routes
xcopy .\routes %1\routes /SY

md lib
xcopy  .\lib %1\lib /SY

md views
xcopy .\views %1\views /SY

md data_model
xcopy .\data_model %1\data_model /SY

md public
xcopy .\public %1\public /SY

copy *.json %1
copy app.js %1
copy *.bat %1
copy *.txt %1

goto installService

:update-ug5k
md %1\routes
xcopy .\routes %1\routes /SY

md lib
xcopy  .\lib %1\lib /SY

md views
xcopy .\views %1\views /SY

md data_model
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
echo **** Crear servicio Ulises G5000  (64 bits) ****
echo *************************************************
echo.
echo.
choice /C SN /M "¿Quiere crear el servicio Ulises G5000? (S)í (N)o" 
SET instala=%errorlevel%
if errorlevel 2 goto fin
if errorlevel 1 goto instala-service
goto installService

:instala-service
".\nss\win64\nssm.exe" install Ulises-G5000
goto fin

:install-incidencias
"C:\Program Files\MySQL\MySQL Server 5.6\bin\mysql.exe" --host=localhost --user=root --password="U5K-G"  < "C:\\UG5K-Serv\\data_model\\BD_UG5K_New_Installation.sql"

@echo "Actualización de las tablas de incidencias finalizada."
pause
goto fin

:installService

goto fin

:errorInstallation
@echo restore drive:install_path_UG5K-SERV

:fin
@echo Fin de la instalacion
pause
