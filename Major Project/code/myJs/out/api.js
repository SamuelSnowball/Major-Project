YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Camera",
        "WaterSystem"
    ],
    "modules": [
        "Engine",
        "Graphics"
    ],
    "allModules": [
        {
            "displayName": "Engine",
            "name": "Engine",
            "description": "Handles user input and changes the 4 movement variables\n\t\nW Key:\n\tMoves camera up\nS Key:\n\tMoves camera down\t\n\nR Key:\n\tMoves camera up\nF Key:\n\tMoves camera down"
        },
        {
            "displayName": "Graphics",
            "name": "Graphics",
            "description": "The file includes code for:\n\nCreation of reflection frame buffer and its texture \nCreation of refraction frame buffer and its texture\n\nWaterVertexShader\nWaterFragmentShader\nCreating and linking shaders into the water program\n\nRendering the scene to the reflection and refraction textures and applying those textures to a water quad\n\nAnd finally rendering the water quad"
        }
    ],
    "elements": []
} };
});