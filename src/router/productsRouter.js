const { Router } = require("express");
const ProductManager = require('../dao/fileSystem/productManager.js');

const router = Router();  // Crear el router fuera de la función consulta

// Instanciamos ProductManager 
const pm = new ProductManager();

router.get("/", async (req, res) => {
    try {
        let productos = await pm.getProducts();
        const limit = req.query.limit;

        if (limit) {
            return res.send(productos.slice(0, limit));
        } else {
            return res.send(productos);
        }
    } catch (error) {
        return res.status(500).send({ status: "error", mensaje: "Hubo un problema al obtener los productos" });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        let { pid } = req.params;
        let producto = await pm.getProduct(pid);
        if (!producto) {
            return res.status(404).send({ status: "error", mensaje: "Este Producto no existe" });
        }
        res.send(producto);
    } catch (error) {
        return res.status(500).send({ status: "error", mensaje: "Hubo un problema al obtener el producto" });
    }
});

router.post("/", async (req, res) => {
    try {
        const producto = req.body;
        
        // Validar si falta algún campo
        if (!producto.title || !producto.description || !producto.price || 
            !producto.thumbnails || !producto.code || !producto.stock) {
            return res.status(400).send({ status: "error", mensaje: "Completa todos los campos" });
        }

        let busquedaDeCode = await pm.readProducts();
        let codeExiste = busquedaDeCode.find(auto => auto.code === producto.code);

        if (codeExiste) {
            return res.status(400).send({ status: "error", mensaje: "Codigo ingresado anteriormente" });
        }

        await pm.addProduct(producto);
        res.status(200).send({ status: "success", mensaje: "Producto agregado correctamente", producto });
    } catch (error) {
        return res.status(500).send({ status: "error", mensaje: "Hubo un problema al agregar el producto" });
    }
});

router.put("/:pid", async (req, res) => {
    try {
        let { pid } = req.params;
        let producto = req.body;
        let productoActualizado = await pm.updateProduct(pid, producto);

        if (!productoActualizado) {
            return res.status(404).send({ status: "error", mensaje: "Producto no encontrado para actualizar" });
        }

        res.status(200).send({ status: "success", mensaje: "Producto actualizado", productoActualizado });
    } catch (error) {
        return res.status(500).send({ status: "error", mensaje: "Hubo un problema al actualizar el producto" });
    }
});

router.delete("/:pid", async (req, res) => {
    try {
        let { pid } = req.params;
        let productoBorrado = await pm.deleteProduct(pid);

        if (!productoBorrado) {
            return res.status(404).send({ status: "error", mensaje: "Producto no encontrado para eliminar" });
        }

        res.status(200).send({ status: "success", mensaje: "Producto eliminado", productoBorrado });
    } catch (error) {
        return res.status(500).send({ status: "error", mensaje: "Hubo un problema al eliminar el producto" });
    }
});

module.exports = router;
