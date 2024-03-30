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

app.post("/", async (req,res)=>{
    const queryURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?";
    const userChosenType= req.body.type;
    const userChosenFilter = req.body.filter;
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
        let response = await axios.get(APIrequest);
        if (userChosenType == "cocktailIngredient"){
            const ingredient = response.data.ingredients[0];
            const ingredientName = ingredient.strIngredient;
            const ingredientDescription = ingredient.strDescription;
    
            res.render("index.ejs", {
                ingredientName,
                ingredientDescription,
            });

        }
        else{
            let drinkIndex = 0;
            let drink = response.data.drinks[drinkIndex];

            while (drink.strInstructions.length > 583){
                if (userChosenType == "cocktailName"){
                    try{
                        drinkIndex++;
                        drink = response.data.drinks[drinkIndex];
                    }
                    catch{
                        throw new TypeError(); //no recipe that has a queried name && length <= 583 exists
                    }
                }
                else{
                    response = await axios.get(APIrequest); //make a new request
                    drink = response.data.drinks[0];
                }
            }

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
                ingredientMeasurementArr,
            });
        }    
      } 
      catch (error){
        if (error instanceof TypeError){
            res.render("index.ejs", {
                error: `"${userChosenFilter}" not found`,
            });
        }
        else{
            console.log(error);
            res.status(500);
        }
      }
});

app.listen(port, () =>{
    console.log(`Port ${port} successfully started.`);
});