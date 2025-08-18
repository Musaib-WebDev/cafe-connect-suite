import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: {
        translation: {
          // Navigation
          home: 'Home',
          cafes: 'Cafes',
          menu: 'Menu',
          orders: 'Orders',
          reservations: 'Reservations',
          dashboard: 'Dashboard',
          login: 'Login',
          register: 'Register',
          logout: 'Logout',
          
          // Common
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
          add: 'Add',
          search: 'Search',
          filter: 'Filter',
          back: 'Back',
          next: 'Next',
          previous: 'Previous',
          
          // Auth
          email: 'Email',
          password: 'Password',
          name: 'Name',
          phone: 'Phone',
          confirmPassword: 'Confirm Password',
          forgotPassword: 'Forgot Password?',
          dontHaveAccount: "Don't have an account?",
          alreadyHaveAccount: 'Already have an account?',
          
          // Menu
          category: 'Category',
          price: 'Price',
          description: 'Description',
          ingredients: 'Ingredients',
          allergens: 'Allergens',
          addToCart: 'Add to Cart',
          
          // Orders
          orderNumber: 'Order Number',
          orderStatus: 'Order Status',
          orderTotal: 'Order Total',
          placeOrder: 'Place Order',
          
          // Reservations
          reservationDate: 'Reservation Date',
          reservationTime: 'Reservation Time',
          partySize: 'Party Size',
          tableNumber: 'Table Number',
          makeReservation: 'Make Reservation',
          
          // Status
          pending: 'Pending',
          confirmed: 'Confirmed',
          preparing: 'Preparing',
          ready: 'Ready',
          served: 'Served',
          completed: 'Completed',
          cancelled: 'Cancelled'
        }
      },
      es: {
        translation: {
          // Navigation
          home: 'Inicio',
          cafes: 'Cafés',
          menu: 'Menú',
          orders: 'Pedidos',
          reservations: 'Reservas',
          dashboard: 'Panel',
          login: 'Iniciar Sesión',
          register: 'Registrarse',
          logout: 'Cerrar Sesión',
          
          // Common
          loading: 'Cargando...',
          error: 'Error',
          success: 'Éxito',
          save: 'Guardar',
          cancel: 'Cancelar',
          delete: 'Eliminar',
          edit: 'Editar',
          add: 'Agregar',
          search: 'Buscar',
          filter: 'Filtrar',
          back: 'Atrás',
          next: 'Siguiente',
          previous: 'Anterior',
          
          // Auth
          email: 'Correo Electrónico',
          password: 'Contraseña',
          name: 'Nombre',
          phone: 'Teléfono',
          confirmPassword: 'Confirmar Contraseña',
          forgotPassword: '¿Olvidaste tu contraseña?',
          dontHaveAccount: '¿No tienes una cuenta?',
          alreadyHaveAccount: '¿Ya tienes una cuenta?',
          
          // Menu
          category: 'Categoría',
          price: 'Precio',
          description: 'Descripción',
          ingredients: 'Ingredientes',
          allergens: 'Alérgenos',
          addToCart: 'Agregar al Carrito',
          
          // Orders
          orderNumber: 'Número de Pedido',
          orderStatus: 'Estado del Pedido',
          orderTotal: 'Total del Pedido',
          placeOrder: 'Realizar Pedido',
          
          // Reservations
          reservationDate: 'Fecha de Reserva',
          reservationTime: 'Hora de Reserva',
          partySize: 'Tamaño del Grupo',
          tableNumber: 'Número de Mesa',
          makeReservation: 'Hacer Reserva',
          
          // Status
          pending: 'Pendiente',
          confirmed: 'Confirmado',
          preparing: 'Preparando',
          ready: 'Listo',
          served: 'Servido',
          completed: 'Completado',
          cancelled: 'Cancelado'
        }
      }
    }
  });

export default i18n;