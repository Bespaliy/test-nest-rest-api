psql -f install.sql -U postgres
PGPASSWORD=test psql -d application -f structure.sql -U test