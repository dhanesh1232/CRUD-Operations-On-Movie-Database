const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDirectorNameAndDirectorIdTocamelCase = (eachDirector) => {
  return {
    directorId: eachDirector.director_id,
    directorName: eachDirector.director_name,
  };
};
const convertMovieName = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//GET Movie API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(movieArray.map((eachMovie) => convertMovieName(eachMovie)));
});

//Add Movies API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { director_id, movie_name, lead_actor } = movieDetails;
  //console.log(movieDetails);
  const addMovieQuery = `
  INSERT INTO
    movie (director_id,movie_name,lead_actor)
  VALUES
    (
        '${director_id}',
        '${movie_name}',
        '${lead_actor}'
    );`;
  const dbResponse = await db.run(addMovieQuery);
  const movie_id = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//GET Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log({ movieId });
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie
    WHERE 
      movie_id = ${movieId};`;
  const myMovie = await db.get(getMovieQuery);
  response.send(myMovie);
});

//Update Movie API
app.put("/movies/:directorId/", async (request, response) => {
  const { directorId } = request.params;
  //console.log({ directorId });
  const movieDetails = request.body;
  const { director_id, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
     movie
    SET
     director_id = '${director_id}',
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
    WHERE
     director_id = ${directorId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
     movie
    WHERE 
     movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Director API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
    *
    FROM 
    director;`;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorNameAndDirectorIdTocamelCase(eachDirector)
    )
  );
});

//GET Director With Movie API
app.get("/directors/:directorId/movie/", async (request, response) => {
  const { directorId } = request.params;
  console.log({ directorId });
  const getDirectorMovieQuery = `
    SELECT
     * 
    FROM 
     movie
    WHERE 
     director_id = ${directorId}
    ORDER BY 
    movie_id;`;
  const directorMoviesArray = await db.all(getDirectorMovieQuery);
  response.send(
    directorMoviesArray.map((eachMovie) => convertMovieName(eachMovie))
  );
});

module.exports = app;
