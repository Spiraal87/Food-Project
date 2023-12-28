'use strict'

const postVal = {
  budget: 0,
  location: "",
  time: 1,
  meals: 1,
  info: "",
  unit: ""
};

const userData = {
  firstName: "a",
  lastName: "b",
  username: "c",
  password: "d"
};

const loginData = {
  username: "a",
  password: "b"
};

const update = {
  username: "a",
  firstName: "b",
  lastName: "c"
};

let authToken;
let info;
let unit;
let firstCitySearch;
let newCityComparison;

function getNumbeoData(cityName, callback) {
  const settings = {
    url: "/makeRequest/" + cityName,
    dataType: "json",
    type: "GET",
    success: callback
  };

  $.ajax(settings);
}

function createUser(data, callback, err) {
  const settings = {
    url: "/api/users",
    dataType: "json",
    type: "POST",
    data: JSON.stringify(data),
    success: callback,
    error: err,
    contentType: "application/json"
  };

  $.ajax(settings);
}

function loginUser(data, callback, err) {
  const settings = {
    url: "/api/auth/login",
    dataType: "json",
    type: "POST",
    data: JSON.stringify(data),
    success: callback,
    error: err,
    contentType: "application/json"
  };

  $.ajax(settings);
  $(".search").removeAttr("hidden");
}

function round(number, precision) {
  var shift = function (number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision;
    }
    var numArray = ("" + number).split("e");
    return +(
      numArray[0] +
      "e" +
      (numArray[1] ? +numArray[1] + precision : precision)
    );
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
}

function displayNumbeoData(response) {
  let calcResult = 0;
  const location = $("#location").val();
  const budget = $("#budget").val();
  const time = $("#time").val();
  unit = $("#unit").val();
  const meals = $("#meals").val();

  $(".container-results").removeClass("hidden");
  $(".search").addClass("hidden");
  $(".searchnav").removeAttr("hidden");

  let currencyLocation =
    response.currency +
    " to eat out in " +
    location +
    " for the duration of your stay.";

  if (unit === "Weeks") {
    calcResult = response.data["average_price"] * 7 * time * meals;
    let currencyLocation =
      response.currency +
      " to eat out in " +
      location +
      " for the duration of your stay.";
    let p = $(".container-results p");

    p.html(
      " The average cost to eat out in " +
      location +
      ' at an inexpensive restaurant: <span class="cost"> ' +
      round(response.data["average_price"], 2) +
      "</span> " +
      response.currency +
      "." +
      "<br><br>" +
      ' It will be roughly <span class="price"> ' +
      round(calcResult, 2) +
      "</span> " +
      currencyLocation
    );
  } else if (unit === "Days") {
    calcResult = response.data["average_price"] * time * meals;

    $(".container-results p").html(
      " The average cost to eat out in " +
      location +
      ' at an inexpensive restaurant: <span class="cost"> ' +
      round(response.data["average_price"], 2) +
      "</span> " +
      response.currency +
      "." +
      "<br><br>" +
      ' It will be roughly <span class="price">  ' +
      round(calcResult, 2) +
      "</span> " +
      currencyLocation
    );
  }

  if (calcResult <= budget) {
    let surplusCash = budget - calcResult;
    let n =
      " It will be roughly " +
      round(calcResult, 2) +
      currencyLocation +
      "<br><br>" +
      'Extra cash:<span class="surplus">  ' +
      round(surplusCash, 2) +
      " </span> " +
      response.currency;
    info = n;
    $(".container-results p").append(
      "<br><br>" +
      ' Nice, looks like you will have an extra <span class="surplus">  ' +
      round(surplusCash, 2) +
      "</span> " +
      response.currency +
      " to spend on stuff!"
    );
  } else {
    let neededCash = calcResult - budget;
    let m =
      " It will be roughly " +
      round(calcResult, 2) +
      currencyLocation +
      "<br><br>" +
      ' Deficit: <span class="deficit"> ' +
      round(neededCash, 2) +
      " </span> " +
      response.currency;
    info = m;
    $(".container-results p").append(
      "<br><br>" +
      ' Whoops, looks like you will need an extra <span class="deficit"> ' +
      round(neededCash, 2) +
      "</span> " +
      response.currency +
      " to eat out that much!"
    );
  }

  let averagePrice = response.data["average_price"];
  firstCitySearch = averagePrice;
}

function sendSearchData(post, callback) {
  const settings = {
    headers: { Authorization: `Bearer ${authToken.authToken}` },
    url: "/searchData",
    dataType: "json",
    type: "POST",
    data: JSON.stringify(post),
    success: callback,
    contentType: "application/json"
  };
  $.ajax(settings);
}

function getSearchData(callback) {
  const settings = {
    headers: { Authorization: `Bearer ${authToken.authToken}` },
    url: "/searchData",
    dataType: "json",
    type: "GET",
    success: callback,
    contentType: "application/json"
  };

  $.ajax(settings);
}

function deleteSearchData(id, callback) {
  const settings = {
    headers: { Authorization: `Bearer ${authToken.authToken}` },
    url: "/searchData/" + id,
    dataType: "json",
    type: "DELETE",
    success: callback,
    contentType: "application/json"
  };

  $.ajax(settings);
}

function updateUser(post, callback, id) {
  const settings = {
    headers: { Authorization: `Bearer ${authToken.authToken}` },
    url: "/searchData/" + id,
    dataType: "json",
    type: "PUT",
    data: JSON.stringify(post),
    success: callback,
    contentType: "application/json"
  };

  $.ajax(settings);
}

function displaySearchData(data) {
  let p = $(".container-history p");
  let renderingPosts = data.posts.map(post => ({
    Location: post.location,
    Budget: post.budget + " USD",
    Meals_a_day: post.meals + " (eating out)",
    Length_of_stay: post.time + "" + post.unit,
    Result: post.info,
    id: post._id
  }));
  console.log(renderingPosts);

  let html = "";
  var array = renderingPosts;
  if (array) {
    $.each(array, function (i) {
      html +=
        '<div class="searchwrap"><ul><div class="wrapper"><button class="historyremove" data-id="' +
        array[i].id +
        '"><span class="button-label">remove</span></button></div>';
      delete array[i].id;
      $.each(array[i], function (key, value) {
        html += "<li>" + key + ": " + value + "</li>";
      });

      html += "</ul></div>";
      html += "<br></br>";
    });

    $(".container-history p").html(html);

    $(".historyremove").on("click", function () {
      deleteSearchData($(this).data("id"), function (obj) {
        removeSearchData(obj);
      });
    });
  }
}

function removeSearchData(obj) {
  $(`button[data-id="${obj._id}"]`)
    .closest(".searchwrap")
    .remove();
}

function successFunction() {
  console.log("success");
}

function userCreated() {
  $(".signup").addClass("hidden");
  $(".login").removeClass("hidden");
  $(".reset-link").removeClass("hidden");
}

function userLoggedIn(data) {
  authToken = data;
  $(".home").attr("hidden", "true");
  $(".topnav p").append("Welcome, ", loginData.username);
  $(".historystore").removeAttr("hidden");
  $(".title").addClass("hidden");
  $(".signin").addClass("hidden");
  $(".logout").removeAttr("hidden");
  $(".login").addClass("hidden");
  $(".search").removeClass("hidden");
  $(".reset-link").removeAttr("hidden");
}

function loginError() {
  $(".containerLogin p").append("Username or password is incorrect.");
}

function createError() {
  $(".container p").text("");
  $(".container p").append("Username is already taken");
}

function deleteData(data) {
  console.log(data);
}

function userUpdate() {
  if (
    update.username === "" &&
    update.firstName === "" &&
    update.lastName === ""
  ) {
    $(".containerReset p").text("No changes made!");
  } else {
    updateUser(update, userUpdate);
    $(".containerReset p").text("User info updated! Logging out...");
    authToken = undefined;
    setTimeout(function () {
      logout();
    }, 3000);
  }
}

function logout() {
  $(".signup").addClass("hidden");
  $(".search").addClass("hidden");
  $(".container-history").addClass("hidden");
  $(".container-results").addClass("hidden");
  $(".historystore").attr("hidden", "true");
  $(".topnav p").text("");
  $(".searchnav").attr("hidden", "true");
  $(".logout").attr("hidden", "true");
  $(".signin").removeClass("hidden");
  $(".login").removeClass("hidden");
  $(".title").removeClass("hidden");
  $(".js-query").text("");
  $(".home").removeAttr("hidden");
  $(".reset").addClass("hidden");
  $(".reset-link").attr("hidden", "true");
  $(".endpoint").addClass("hidden");
  $(".containerReset p").text("");
}

function signupPassword() {
  let x = document.getElementById("password");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function loginPassword() {
  let x = document.getElementById("password-login");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function displayComparison(obj) {
  let newCitySearch = obj.data.average_price;
  $(".container-results h3").text("");
  if (newCitySearch > firstCitySearch) {
    let percentDifference = newCitySearch / firstCitySearch;
    $(".container-results h3").append(
      "Eating out in " +
      newCityComparison +
      " would be about " +
      round(percentDifference, 2) +
      "x more expensive!"
    );
  } else {
    let percentDifference = firstCitySearch / newCitySearch;
    $(".container-results h3").append(
      "Eating out in " +
      newCityComparison +
      " would be about " +
      round(percentDifference, 2) +
      "x cheaper!"
    );
  }
  if (newCitySearch === firstCitySearch) {
    $(".container-results h3").text("");
    $(".container-results h3").append(
      "Eating out here will be about the same!"
    );
  }
}

function footerAlign() {
  $(".footer").css("display", "block");
  $(".footer").css("height", "auto");
  var footerHeight = $(".footer").outerHeight();
  $("body").css("padding-bottom", footerHeight);
  $(".footer").css("height", footerHeight);
}

$(document).ready(function () {
  footerAlign();
});

$(window).resize(function () {
  footerAlign();
});

function setupClickHandlers() {
  $(".search").submit(event => {
    event.preventDefault();
    postVal.location = $(event.currentTarget)
      .find("#location")
      .val();
    postVal.budget = $(event.currentTarget)
      .find("#budget")
      .val();
    postVal.time = $(event.currentTarget)
      .find("#time")
      .val();
    postVal.meals = $(event.currentTarget)
      .find("#meals")
      .val();
    $(".container-results p").text("");
    $(".container-results h3").text("");
    $(".endpoint p").text("");
    getNumbeoData(postVal.location, displayNumbeoData);
  });

  $(".js-compare-btn").on("click", function () {
    newCityComparison = $("#compare").val();
    getNumbeoData(newCityComparison, displayComparison);
  });

  $(".signup").submit(event => {
    event.preventDefault();
    userData.firstName = $(event.currentTarget)
      .find("#firstName")
      .val();
    userData.lastName = $(event.currentTarget)
      .find("#lastName")
      .val();
    userData.username = $(event.currentTarget)
      .find("#email")
      .val();
    userData.password = $(event.currentTarget)
      .find("#password")
      .val();
    createUser(userData, userCreated, createError);
  });

  $(".login").submit(event => {
    event.preventDefault();
    loginData.username = $(event.currentTarget)
      .find("#email-login")
      .val();
    loginData.password = $(event.currentTarget)
      .find("#password-login")
      .val();
    loginUser(loginData, userLoggedIn, loginError);
    $(".containerLogin p").text("");
  });

  $(".reset-form").submit(event => {
    event.preventDefault();
    update.username = $(event.currentTarget)
      .find("#username")
      .val();
    update.firstName = $(event.currentTarget)
      .find("#firstname")
      .val();
    update.lastName = $(event.currentTarget)
      .find("#lastname")
      .val();
    userUpdate();
  });

  $(".save").on("click", function () {
    postVal.info = info;
    postVal.unit = unit;
    $(".container-results").addClass("hidden");
    $(".endpoint p").append("Check your history or try making another search!");
    $(".endpoint").removeClass("hidden");
    sendSearchData(postVal, successFunction);
  });

  $(".delete").on("click", function () {
    $(".container-results").addClass("hidden");
  });

  $(".historystore").on("click", function () {
    $(".signup").addClass("hidden");
    $(".login").addClass("hidden");
    $(".container-history").removeClass("hidden");
    $(".search").addClass("hidden");
    $(".searchnav").removeAttr("hidden");
    $(".title").addClass("hidden");
    $(".reset").addClass("hidden");
    $(".endpoint").addClass("hidden");
    $(".container-results").addClass("hidden");
    getSearchData(displaySearchData);
  });

  $(".historyremove").on("click", function () {
    deleteSearchData(deleteData);
  });

  $(".home").on("click", function () {
    $(".signup").addClass("hidden");
    $(".login").addClass("hidden");
    $(".search").addClass("hidden");
    $(".container-history").addClass("hidden");
    $(".searchnav").attr("hidden", "true");
    $(".title").removeClass("hidden");
    $(".endpoint").addClass("hidden");
    $(".landing").removeClass("hidden");
  });

  $(".login-link").on("click", function () {
    $(".login").removeClass("hidden");
    $(".signup").addClass("hidden");
    $(".search").addClass("hidden");
    $(".container-history").addClass("hidden");
    $(".container-results").addClass("hidden");
  });

  $(".reset-link").on("click", function () {
    $(".login").addClass("hidden");
    $(".signup").addClass("hidden");
    $(".search").addClass("hidden");
    $(".container-history").addClass("hidden");
    $(".container-results").addClass("hidden");
    $(".reset").removeClass("hidden");
    $(".searchnav").removeAttr("hidden");
  });

  $(".btn-1").on("click", function () {
    $(".login").add("hidden");
    $(".signup").removeClass("hidden");
    $(".search").addClass("hidden");
    $(".container-history").addClass("hidden");
    $(".container-results").addClass("hidden");
    $(".landing").addClass("hidden");
  });

  $(".btn-2").on("click", function () {
    $(".login").removeClass("hidden");
    $(".signup").addClass("hidden");
    $(".search").addClass("hidden");
    $(".container-history").addClass("hidden");
    $(".container-results").addClass("hidden");
    $(".landing").addClass("hidden");
  });

  $(".logout").on("click", function () {
    $(".signup").addClass("hidden");
    $(".search").addClass("hidden");
    $(".container-history").addClass("hidden");
    $(".container-results").addClass("hidden");
    $(".historystore").attr("hidden", "true");
    $(".topnav p").text("");
    $(".searchnav").attr("hidden", "true");
    $(".logout").attr("hidden", "true");
    $(".signin").removeClass("hidden");
    $(".login").removeClass("hidden");
    $(".title").removeClass("hidden");
    $(".js-query").text("");
    $(".home").removeAttr("hidden");
    $(".reset").addClass("hidden");
    $(".reset-link").attr("hidden", "true");
    $(".endpoint").addClass("hidden");
    authToken = undefined;
  });

  $(".searchnav").on("click", function () {
    $(".login").addClass("hidden");
    $(".signup").addClass("hidden");
    $(".search").removeClass("hidden");
    $(".container-history").addClass("hidden");
    $(".container-results").addClass("hidden");
    $(".searchnav").attr("hidden", "true");
    $(".reset").addClass("hidden");
    $(".endpoint").addClass("hidden");
  });
}

$(function () {
  setupClickHandlers();
});
