//Navbar escritorio/tablets

//Revisar que hay un problema que, cuando hay un producto que sus variantes valen lo mismo, y por ende el precio no esta en cada variante, eso hace romper el codigo
// y hace que de el error de  read properties of undefined (reading 'toLocaleString') por lo tanto hay que ajustar eso, ya se poniendo el precio aunque sea el mismo para cada variantes,
// o manejar logica adicional para este apartado
const navBarRight = document.querySelector('.navbar-right');

const menuEmail = document.querySelector('.navbar-email');
const menuHamIcon = document.querySelector('.menu');
const menuCarritoIcon = document.querySelector('.navbar-shopping-cart');
const productDetailCloseIcon = document.querySelector('.product-detail-close');
const desktopMenu = document.querySelector('.desktop-menu');
const mobileMenu = document.querySelector('.mobile-menu');

//Shopping cart menu/Product details
const buttonProductDetailaddProductToCart = document.querySelector('.add-to-cart-button');
const asideShoppingCart = document.querySelector('#asideShoppingCart');
const productDetailContainer = document.querySelector('#productDetail');

const arrowAsideClose = document.querySelector('.arrow-close');
const cardsContainer = document.querySelector('.cards-container');
const darken = document.querySelector('.darken');

const mobileMenuLine = document.querySelector('.mobile-menu ul:nth-child(1)');

// const testProducts = [{id: 1, name: 'Producto Test', price: 100, variations: [{ images: ['https://placehold.co/600x400'] }]}];
const productList = [];
let carritoGlobal = [];
let checkoutButton;
// Llamamos a esta función cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    fetch('../data/articles_v2.json')
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.products)) {
                productList.push(...data.products);
                renderProducts(productList);
            } else {
                console.error('La propiedad "products" no existe o no es un array');
            }
        })
        .catch(error => console.error('Error al cargar los datos:', error));
    cargarCarritoDesdeLocalStorage(),
    renderactualizarContadorCarrito(contarProductosEnCarrito(carritoGlobal));

    //Para que al dar click ocurra el filtrado por categorias:
    const category = window.location.hash.substring(1) || 'all';
    filterProducts(category);
});

// Manejador de eventos a cada enlace de la barra de navegación. 
document.querySelectorAll('.nav-link').forEach(item => {
    item.addEventListener('click', (e) => {
        mobileMenu.classList.remove('active');
        mobileMenuLine.classList.remove('active');
        e.preventDefault();
        const category = item.getAttribute('data-category');
        filterProducts(category);
        window.history.pushState({ category }, `Category: ${category}`, `#${category}`);
    });
});

window.addEventListener('popstate', (e) => {
    const category = e.state?.category || 'all';
    filterProducts(category);
});

document.addEventListener('DOMContentLoaded', () => {
    checkoutButton = document.getElementById('checkoutButton');
  
    checkoutButton.addEventListener('click', () => {
      window.location.href = 'checkout.html'; // Cambia esto por la URL de tu página de contacto
    });

    checkCartStatus();
  });  

// Declarando funciones para abrir y cerrar los contenedores
const toggleDesktopMenu = () => {
    asideShoppingCart.classList.remove('show');
    desktopMenu.classList.toggle('inactive');
};

const toggleMobileMenu = () => {
    asideShoppingCart.classList.remove('show');
    mobileMenu.classList.toggle('active');
    mobileMenuLine.classList.toggle('active');
    productDetailContainer.classList.remove('show');
    darken.classList.remove('show');
};

const toggleCarritoAside = () => {
    mobileMenu.classList.remove('active');
    mobileMenuLine.classList.remove('active');
    desktopMenu.classList.add('inactive');

    // Si el detalle del producto está abierto, ciérralo pero no alteres 'darken'
    if (productDetailContainer.classList.contains('show')) {
        productDetailContainer.classList.remove('show');
    } else {
        // Si el detalle del producto no está abierto, entonces alterna 'darken'
        darken.classList.toggle('show');
    }

    asideShoppingCart.classList.toggle('show');
    renderCart(carritoGlobal);
};

const openProductDetailAside = () => {
    mobileMenu.classList.remove('active');
    mobileMenuLine.classList.remove('active');
    desktopMenu.classList.add('inactive');
    asideShoppingCart.classList.remove('show');

    productDetailContainer.classList.toggle('show');
    darken.classList.toggle('show');
};

const closeProductDetailAside = () => {
    productDetailContainer.classList.remove('show');
    
    // Verificar si el carrito está abierto antes de quitar 'darken'
    if (!asideShoppingCart.classList.contains('show')) {
        darken.classList.remove('show');
    }
};

const closeOverlays = () => {
    productDetailContainer.classList.remove('show');
    asideShoppingCart.classList.remove('show');
    darken.classList.remove('show');
};

// llamando eventos para abrir y cerrar los contenedores
menuEmail.addEventListener('click', toggleDesktopMenu);
menuHamIcon.addEventListener('click', toggleMobileMenu);
menuCarritoIcon.addEventListener('click', toggleCarritoAside);
arrowAsideClose.addEventListener('click', toggleCarritoAside);
productDetailCloseIcon.addEventListener('click', closeProductDetailAside);
darken.addEventListener('click', closeOverlays);

// Declaración de selectores y array para Shopping Cart
// const shoppingContainer = document.querySelector('.shopping-container');
const totalProduct = document.querySelector('.product-count');
const totalPrice = document.querySelector('.price-count');
const shoppingPriceProducts = [];

function checkCartStatus() {
    console.log("entra a checkar el status");
    if (carritoGlobal.length === 0) {
      // Desactiva el botón si el carrito está vacío
      checkoutButton.disabled = true;
      checkoutButton.classList.add('primary-button-disabled');
      checkoutButton.classList.remove('hover-neon-effect'); 
      checkoutButton.classList.remove('primary-button-active');
    } else {
      // Activa el botón si hay elementos en el carrito
      checkoutButton.disabled = false;
      checkoutButton.classList.remove('primary-button-disabled');
      checkoutButton.classList.add('hover-neon-effect');
      checkoutButton.classList.add('primary-button-active'); 
    }
  }

const isFloat = value => Number(value) === value && value % 1 !== 0;

function formatPrice(price) {
    return price.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });
}

function handleImageError(imageElement) {
    imageElement.onerror = null; // Eliminar el manejador de error existente para evitar bucles infinitos
    imageElement.src = 'https://placehold.co/600x400'; // Puedes cambiar esta URL por cualquier imagen de respaldo que prefieras
}


// Función para poner los datos del producto seleccionado en la ventana de Detalles
let currentButtonListener = null; // Definimos la variable fuera de la función para mantener su valor.
const detailsProduct = product => {
    openProductDetailAside();

    const detailImage = document.querySelector('#productDetail>img');
    const detailPrice = document.querySelector('.product-info p:nth-child(1)');
    const detailName = document.querySelector('.product-info p:nth-child(2)');
    const detailDescription = document.querySelector('.product-info p:nth-child(3)');
    const buttonAddToCart = document.querySelector('.add-to-cart-button');
    const variantSelector = document.querySelector('.variant-selector'); // Selector de variantes

    detailImage.onerror = () => handleImageError(detailImage);

    // Limpiar opciones anteriores
    variantSelector.innerHTML = '';

    // Llenar el selector de variantes si están disponibles
    if (product.variations && product.variations.length > 0) {
        product.variations.forEach(variation => {
            let option = document.createElement('option');
            option.value = variation.variantID;
            option.textContent = `${variation.attribute}: ${variation.value}`;
            variantSelector.appendChild(option);
        });

        // Actualizar la imagen y el precio basado en la variante seleccionada
        variantSelector.addEventListener('change', () => {
            const selectedVariant = product.variations.find(v => v.variantID === variantSelector.value);
            detailImage.setAttribute('src', selectedVariant.images.length ? selectedVariant.images[0] : 'https://placehold.co/600x400');
            detailImage.onerror = () => handleImageError(detailImage); // Asegurarse de que el manejo de error se aplica a la nueva imagen
            detailPrice.innerText = formatPrice(selectedVariant.price);
        });

        // Disparar el cambio inicial para cargar los detalles de la primera variante
        variantSelector.dispatchEvent(new Event('change'));
    } else {
        // No hay variantes, ocultar el selector
        variantSelector.style.display = 'none';

        // Mostrar detalles generales del producto
        detailImage.src = getFirstProductImage(product);
        detailImage.onerror = () => handleImageError(detailImage);
        detailPrice.innerText = formatPrice(getFirstProductoPrice(product));
    }

    detailName.innerText = product.name;
    detailDescription.innerText = product.description;

    if (currentButtonListener) {
        buttonAddToCart.removeEventListener('click', currentButtonListener);
    }

    currentButtonListener = () => {
        addProductToCart(product.id);
        renderCart(carritoGlobal);
        renderactualizarContadorCarrito(contarProductosEnCarrito(carritoGlobal));
    }

    buttonAddToCart.addEventListener('click', currentButtonListener);
};


// Función para agregar los productos en el main
const renderProducts = arr => {
    arr.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        
        const firstImage = getFirstProductImage(product);
             
        const productImg = document.createElement('img');
        productImg.setAttribute('src', firstImage);
        productImg.setAttribute('alt', product.name);
        productImg.classList.add('cur-p');
        productImg.addEventListener('click', function () {
            detailsProduct(product);
        });
        productImg.onerror = function(){
            this.onerror = null;
            this.src = 'https://placehold.co/600x400';
        }

        const productInfo = document.createElement('div');
        productInfo.classList.add('product-info');

        const productInfoDiv = document.createElement('div');

        // Determinar el precio del producto
        const price = getFirstProductoPrice(product);

        const productPrice = document.createElement('p');
        productPrice.innerText = formatPrice(price);

        const productName = document.createElement('p');
        productName.innerText = product.name;

        productInfoDiv.appendChild(productPrice);
        productInfoDiv.appendChild(productName);

        const productInfoFigure = document.createElement('figure');
        const productImgCard = document.createElement('img');
        productImgCard.setAttribute('src', './icons/bt_add_to_cart.svg');
        productImgCard.classList.add('cur-p');


        // productInfoFigure.addEventListener('click', function () {
        //     addProductToCart(product.id);
        //     renderCart(carritoGlobal);
        //     renderactualizarContadorCarrito(contarProductosEnCarrito(carritoGlobal));
        // });

        // Modificación para controlar el comportamiento del botón de añadir al carrito
        if (!product.variations || product.variations.length === 0) {
            // Si no hay variaciones, permitir añadir al carrito directamente
            productInfoFigure.addEventListener('click', function () {
                addProductToCart(product.id);
                renderCart(carritoGlobal);
                renderactualizarContadorCarrito(contarProductosEnCarrito(carritoGlobal));
            });
        } else {
            // Si hay variaciones, redirigir a los detalles del producto
            productInfoFigure.addEventListener('click', function () {
                detailsProduct(product);
            });
        }

        productInfoFigure.appendChild(productImgCard);

        productInfo.appendChild(productInfoDiv);
        productInfo.appendChild(productInfoFigure);

        productCard.appendChild(productImg);
        productCard.appendChild(productInfo);

        cardsContainer.appendChild(productCard);
    });
}

    // Determinar la imagen principal del producto
    function getFirstProductImage (product) {
        return (product.images && product.images.length > 0) ? product.images[0] :
        (product.variations && product.variations.length > 0 && product.variations[0].images && product.variations[0].images.length > 0) ? product.variations[0].images[0] :
        'https://placehold.co/600x400';    
    }

    function getFirstProductoPrice(product){
        return product.price ? product.price : 
        (product.variations && product.variations.length > 0 && product.variations[0].price ? product.variations[0].price : 'Precio no disponible');
    }


function filterProducts(category) {
    let filteredProducts = [];
    if (category === 'all') {
        filteredProducts = productList;
    } else {
        filteredProducts = productList.filter(product => product.category === category);
    }
    cardsContainer.innerHTML = '';
    renderProducts(filteredProducts);
}

function addProductToCart(idProducto) {
    const productoExistente = carritoGlobal.find(producto => producto.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carritoGlobal.push({ id: idProducto, cantidad: 1 });
    }
    guardarCarritoEnLocalStorage();
    Toastify({
        text: "Producto agregado",
        duration: 3000,
        destination: "",
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function(){} // Callback after click
      }).showToast();
      checkCartStatus();
}

/*
 * Esta línea actualiza el carritoGlobal eliminando el producto especificado.
 * Se utiliza el método .filter para crear un nuevo array que contiene todos los 
 * productos, excepto aquel cuyo ID coincide con idProducto. Esto se logra mediante
 * una función de flecha que compara el ID de cada producto en carritoGlobal con 
 * idProducto. Si el ID del producto es diferente de idProducto, el producto se
 * mantiene en el nuevo array. De esta manera, el producto con idProducto es 
 * efectivamente removido del carrito.
 */
function removeFromCart(idProducto) {
    carritoGlobal = carritoGlobal.filter(producto => producto.id !== idProducto);
    guardarCarritoEnLocalStorage();
    checkCartStatus();
}


// Función para buscar el precio de un producto por su ID
function buscarPrecioPorId(id) {
    const producto = productList.find(p => p.id === id);
    return producto ? producto.price : 0;
}

// Función para calcular el total del carrito
function calcularTotalCarrito(carrito) {
    return carrito.reduce((total, item) => {
        const precio = buscarPrecioPorId(item.id);
        return total + (precio * item.cantidad);
    }, 0);
}

function guardarCarritoEnLocalStorage() {
    // Convertir el array del carrito a una cadena JSON
    const carritoJSON = JSON.stringify(carritoGlobal);
    localStorage.setItem('carrito', carritoJSON);
}

function cargarCarritoDesdeLocalStorage() {
    const carritoJSON = localStorage.getItem('carrito');

    // Si hay datos, convertirlos de nuevo a un array y establecer el estado del carrito
    if (carritoJSON) {
        carritoGlobal = JSON.parse(carritoJSON);
    }
}

function contarProductosEnCarrito(carrito) {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function renderactualizarContadorCarrito(totalProductos) {
    const contadorCarrito = document.querySelector('.product-count');
    if (contadorCarrito) {
        contadorCarrito.textContent = totalProductos;
    }
}

function renderCart(arrayCarrito) {
    const totalPriceContainer = asideShoppingCart.querySelector('#TotalPrice');
    const shoppingContainer = document.querySelector('.shopping-container');
    shoppingContainer.innerHTML = '';

    for (let product of arrayCarrito) {
        //Div que contiene el numero de veces que un producto esta repetido en el carrito
        const numberOfSameProduct = document.createElement('div');
        numberOfSameProduct.innerText = product.cantidad;

        //Genero el contenedor del producto
        const productCartContainer = document.createElement('div');
        productCartContainer.classList.add('shopping-cart');

        productDetails = productList.find(producto => producto.id === product.id);
        console.log("Destalles de un producto: ", productDetails);

        //Genero la imagen del producto y la agrego un figure 
        const productImg = document.createElement('img');
        productImg.setAttribute('src', getFirstProductImage(product));
        productImg.setAttribute('alt', productDetails.name);
        productImg.classList.add('hover-neon-effect');
        /*
        * Este bloque de código utiliza una IIFE (Immediately Invoked Function Expression) para manejar
        * los event listeners dentro de un bucle for. Cada iteración del bucle sobrescribe 'productDetails',
        * por lo que sin esta técnica, todos los listeners referirían al último producto en el bucle.
        *
        * La IIFE captura el estado actual de 'productDetails' para cada producto y lo pasa a la función
        * del event listener. Esto asegura que cada listener tenga una copia independiente de los detalles
        * del producto, permitiendo que al hacer clic en una imagen, se muestren los detalles correctos.
        *
        * Este método puede parecer menos directo, pero es crucial para evitar errores comunes en el manejo
        * de variables dentro de bucles. Garantiza una experiencia de usuario coherente y precisa en la
        * visualización de detalles del producto.
 */
        productImg.addEventListener('click', ((details)=>{
            return () =>{
                detailsProduct(details);
            };
        })(productDetails));

        const productFigure = document.createElement('figure');
        productFigure.classList.add('cart-product-figure');
        productFigure.append(productImg, numberOfSameProduct);

        //Agrego el precio y nombre del producto
        const productPrice = document.createElement('p');
        const productName = document.createElement('p');
        console.log("EL precio del producto es ", product.price);
        productPrice.innerText = formatPrice(productDetails.price);
        productName.innerText = productDetails.name;

        //Agrego la imagen para quitar el producto del carrito junto con el evento para eliminarlo y hacer un update de precios
        const productDeleteButton = document.createElement('img');
        productDeleteButton.setAttribute('src', './icons/icon_close.png');
        productDeleteButton.setAttribute('alt', 'close');
        productDeleteButton.addEventListener('click', function () {
            removeFromCart(product.id);
            renderCart(carritoGlobal);
            renderactualizarContadorCarrito(contarProductosEnCarrito(carritoGlobal));

            const totalCarrito = calcularTotalCarrito(carritoGlobal);
            totalPriceContainer.innerText = formatPrice(totalCarrito);
        });

        //Integro todos los componentes
        productCartContainer.append(productFigure, productName, productPrice, productDeleteButton);
        shoppingContainer.appendChild(productCartContainer);

        const totalCarrito = calcularTotalCarrito(carritoGlobal);
        totalPriceContainer.innerText = formatPrice(totalCarrito);
    }
}