# 🎬 MovieTracker — ASP.NET Core 8 + SQL Server + React

Imports movies from the public **TMDB API** (background service), lets users register/login,
save movies with status / rating / notes, and view stats ("top genres").

## 0. Get a free TMDB API key
Create an account at https://www.themoviedb.org → Settings → API → copy the **API Key (v3 auth)**.

## 1. Run the API
```bash
cd api
dotnet tool install --global dotnet-ef                      # once
dotnet user-secrets init                                    # once
dotnet user-secrets set "Tmdb:ApiKey" "YOUR_KEY_HERE"       # keeps the key out of git
dotnet restore
dotnet ef migrations add InitialCreate                      # once
dotnet run
```
Swagger: http://localhost:5080/swagger. Console shows "Imported N new movies from 'popular'".
No LocalDB? Use SQL Server in Docker and edit `ConnectionStrings:Default`:
```bash
docker run -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='Your_strong_Passw0rd' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
# Server=localhost,1433;Database=MovieTracker;User Id=sa;Password=Your_strong_Passw0rd;TrustServerCertificate=True
```

## 2. Run the React app
```bash
cd client && npm install && npm run dev     # http://localhost:5173
```

## API summary
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register, /login | – | returns JWT |
| GET | /api/movies?search&genre&sort&page | – | search/filter/sort/paginate |
| GET | /api/movies/genres, /api/movies/{id} | – | |
| GET | /api/mylist?status | ✔ | my saved movies |
| GET/PUT/DELETE | /api/mylist/{movieId} | ✔ | status, rating 1-5, notes |
| GET | /api/stats | ✔ | totals + top genres |

*This product uses the TMDB API but is not endorsed or certified by TMDB.*
