// Data
const api = axios.create({
  baseURL: "https://api.themoviedb.org/3/",

  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  params: {
    api_key: API_KEY,
    language: "es",
  },
});

function likedMoviesList() {
  const item = JSON.parse(localStorage.getItem("liked_movies"));
  let movies;

  if (item) {
    movies = item;
  } else {
    movies = {};
  }
  return movies;
}

function likedMovie(movie) {
  // movie.id
  const likedMovies = likedMoviesList();

  console.log(likedMovies);

  if (likedMovies[movie.id]) {
    likedMovies[movie.id] = undefined;
  } else {
    likedMovies[movie.id] = movie;
  }

  localStorage.setItem("liked_movies", JSON.stringify(likedMovies));
}

// Utils
const LazyLoader = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const url = entry.target.getAttribute("data-img");
      entry.target.setAttribute("src", url);
    }
  });
});

function createMovies(
  movies,
  container,
  { LazyLoad = false, clean = true } = {}
) {
  if (clean) {
    container.innerHTML = "";
  }

  movies.forEach((movie) => {
    const movieContainer = document.createElement("div");
    movieContainer.classList.add("movie-container");

    const movieImg = document.createElement("img");
    movieImg.classList.add("movie-img");
    movieImg.setAttribute("alt", movie.title);
    movieImg.setAttribute(
      LazyLoad ? "data-img" : "src",
      "https://image.tmdb.org/t/p/w300" + movie.poster_path
    );
    movieImg.addEventListener("click", () => {
      location.hash = "#movie=" + movie.id;
    });
    movieImg.addEventListener("error", () => {
      movieImg.setAttribute(
        "src",
        "https://img.freepik.com/vector-gratis/plantilla-plana-error-404_23-2147746980.jpg?w=826&t=st=1705591306~exp=1705591906~hmac=19b6f6f915abb96150ee837eb09ebd13a8a7b42a1d329d3eac638e050e41badf"
      );
    });

    const movieBtn = document.createElement("button");
    movieBtn.classList.add("movie-btn");
    likedMoviesList()[movie.id] && movieBtn.classList.add("movie-btn--liked");
    movieBtn.addEventListener("click", () => {
      movieBtn.classList.toggle("movie-btn--liked");
      likedMovie(movie);
      getLikedMovies(); // para se que refleje en tiempo real los favoritos sin necesidad de recargar
    });

    if (LazyLoad) {
      LazyLoader.observe(movieImg);
    }

    movieContainer.appendChild(movieImg);
    movieContainer.appendChild(movieBtn);
    container.appendChild(movieContainer);
  });
}

function createCategories(categories, container) {
  container.innerHTML = "";

  categories.forEach((category) => {
    const categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category-container");

    const categoryTitle = document.createElement("h3");
    categoryTitle.classList.add("category-title");
    categoryTitle.setAttribute("id", "id" + category.id);
    categoryTitle.addEventListener("click", () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}

// Llamados a la API
async function getTrendingMoviesPreview() {
  const { data } = await api("trending/movie/day");
  const movies = data.results;
  console.log(movies);

  createMovies(movies, trendingMoviesPreviewList, true);
}

async function getCategegoriesPreview() {
  const { data } = await api("genre/movie/list");
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList);
}

async function getMoviesByCategory(id) {
  const { data } = await api("discover/movie", {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection, { LazyLoad: true });
}

function getPaginatedMoviesByCategory(id) {
  return async function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api("discover/movie", {
        params: {
          with_genres: id,
          page,
        },
      });
      const movies = data.results;

      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
  };
}

async function getMoviesBySearch(query) {
  const { data } = await api("search/movie", {
    params: {
      query,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection);
}

function getPaginateMoviesBySearch(query) {
  return async function () {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api("search/movie", {
        params: {
          query,
          page,
        },
      });
      const movies = data.results;

      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
  };
}

async function getTrendingMovies() {
  const { data } = await api("trending/movie/day");
  const movies = data.results;

  maxPage = data.total_pages;

  createMovies(movies, genericSection, { LazyLoad: true, clean: true });

  // const btnLoadMore = document.createElement("button");
  // btnLoadMore.innerText = "Cargar más";
  // btnLoadMore.addEventListener("click", getPaginatedTrendingMovies);
  // genericSection.appendChild(btnLoadMore);
}

async function getPaginatedTrendingMovies() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;

  const pageIsNotMax = page < maxPage;

  if (scrollIsBottom && pageIsNotMax) {
    page++;
    const { data } = await api("trending/movie/day", {
      params: {
        page,
      },
    });
    const movies = data.results;

    createMovies(movies, genericSection, { LazyLoad: true, clean: false });
  }
}

async function getMovieById(id) {
  const { data: movie } = await api("movie/" + id);

  const movieImgUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
  console.log(movieImgUrl);
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;

  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
}

async function getRelatedMoviesId(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;

  const relatedMoviesContainer = document.querySelector(
    ".relatedMovies-scrollContainer"
  );

  // Limpiar el contenedor antes de agregar nuevas películas
  relatedMoviesContainer.innerHTML = "";

  if (relatedMovies.length === 0) {
    const noMoviesMessage = document.createElement("p");
    noMoviesMessage.classList.add("nothing");
    noMoviesMessage.id = "not-pelis";
    noMoviesMessage.textContent = "No hay películas similares que mostrar";
    relatedMoviesContainer.appendChild(noMoviesMessage);
    return; // Salir de la función si no hay películas similares
  }

  createMovies(relatedMovies, relatedMoviesContainer);
}

function getLikedMovies() {
  const likedMovies = likedMoviesList();
  const moviesArray = Object.values(likedMovies);

  // Verificar si hay películas en favoritos antes de crear y mostrar las películas
  if (moviesArray.length > 0) {
    createMovies(moviesArray, likedMoviesListArticle, {
      lazyLoad: true,
      clean: true,
    });

    likedMoviesSection.classList.remove("inactive");
    console.log(likedMovies);
  } else {
    likedMoviesSection.classList.add("inactive");
  }
}
