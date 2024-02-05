import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
    res.render("index.ejs");
})

app.post("/",async (req,res)=>{
    const queryURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?";
    const userChosenType= req.body.type.value;
    const userChosenFilter = req.body.filter.value;
    let APIrequest = "";
    
    if (userChosenType == "cocktailName"){
        APIrequest = queryURL + "s=" + userChosenFilter;
    }
    else if (userChosenType == "cocktailIngredient"){
        APIrequest = queryURL + "i=" + userChosenFilter;
    }
    else{
        APIrequest = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
    }

    try {
        const response = await axios.get(APIrequest);
        const drink = response.data.drinks[0];
        const drinkName = drink.strDrink;
        const drinkInstructions = drink.strInstructions;
        const cocktailImg = drink.strDrinkThumb;
        let ingredientArr = new Array();
        let ingredientMeasurementArr = new Array();
        
        //query ingredient
        let i = 1;
        while (drink[`strIngredient${i}`] != null){
            ingredientArr.push(drink[`strIngredient${i}`]);
            i++;
        }

        //query measurement
        let j = 1;
        while (drink[`strMeasure${j}`] != null){
            ingredientMeasurementArr.push(drink[`strMeasure${j}`]);
            j++;
        }

        res.render("index.ejs",{
            drinkName,
            drinkInstructions,
            cocktailImg,
            ingredientArr,
            ingredientMeasurementArr
        });
        
      } catch (error) {
        console.log(error.response.data);
        res.status(500);
      }
    
});

app.listen(port, () =>{
    console.log(`Port ${port} successfully started.`);
});