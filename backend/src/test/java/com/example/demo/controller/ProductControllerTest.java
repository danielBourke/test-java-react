package com.example.demo.controller;

import com.example.demo.exception.ProductNotFoundException;
import com.example.demo.model.Product;
import com.example.demo.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product("Test Product", "Test Description", new BigDecimal("29.99"));
        testProduct.setId(1L);
    }

    @Test
    @WithMockUser
    void getAllProducts_ShouldReturnPagedProducts() throws Exception {
        Page<Product> productPage = new PageImpl<>(Arrays.asList(testProduct));
        when(productService.getAllProducts(any(Pageable.class))).thenReturn(productPage);

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Test Product"))
                .andExpect(jsonPath("$.content[0].price").value(29.99));

        verify(productService).getAllProducts(any(Pageable.class));
    }

    @Test
    @WithMockUser
    void getProductById_WhenExists_ShouldReturnProduct() throws Exception {
        when(productService.getProductById(1L)).thenReturn(Optional.of(testProduct));

        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.price").value(29.99));

        verify(productService).getProductById(1L);
    }

    @Test
    @WithMockUser
    void getProductById_WhenNotExists_ShouldReturn404() throws Exception {
        when(productService.getProductById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound());

        verify(productService).getProductById(999L);
    }

    @Test
    @WithMockUser
    void createProduct_WithValidData_ShouldReturnCreated() throws Exception {
        Product newProduct = new Product("New Product", "Description", new BigDecimal("19.99"));
        Product savedProduct = new Product("New Product", "Description", new BigDecimal("19.99"));
        savedProduct.setId(2L);

        when(productService.createProduct(any(Product.class))).thenReturn(savedProduct);

        mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newProduct)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("New Product"));

        verify(productService).createProduct(any(Product.class));
    }

    @Test
    @WithMockUser
    void createProduct_WithInvalidData_ShouldReturn400() throws Exception {
        Product invalidProduct = new Product("", "", new BigDecimal("-1.00"));

        mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidProduct)))
                .andExpect(status().isBadRequest());

        verify(productService, never()).createProduct(any(Product.class));
    }

    @Test
    @WithMockUser
    void updateProduct_WhenExists_ShouldReturnUpdated() throws Exception {
        Product updatedProduct = new Product("Updated Name", "Updated Description", new BigDecimal("39.99"));
        updatedProduct.setId(1L);

        when(productService.updateProduct(eq(1L), any(Product.class))).thenReturn(updatedProduct);

        mockMvc.perform(put("/api/products/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedProduct)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.price").value(39.99));

        verify(productService).updateProduct(eq(1L), any(Product.class));
    }

    @Test
    @WithMockUser
    void updateProduct_WhenNotExists_ShouldReturn404() throws Exception {
        Product updatedProduct = new Product("Updated", "Desc", new BigDecimal("10.00"));

        when(productService.updateProduct(eq(999L), any(Product.class)))
                .thenThrow(new ProductNotFoundException(999L));

        mockMvc.perform(put("/api/products/999")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedProduct)))
                .andExpect(status().isNotFound());

        verify(productService).updateProduct(eq(999L), any(Product.class));
    }

    @Test
    @WithMockUser
    void deleteProduct_WhenExists_ShouldReturnNoContent() throws Exception {
        doNothing().when(productService).deleteProduct(1L);

        mockMvc.perform(delete("/api/products/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(productService).deleteProduct(1L);
    }

    @Test
    @WithMockUser
    void deleteProduct_WhenNotExists_ShouldReturn404() throws Exception {
        doThrow(new ProductNotFoundException(999L)).when(productService).deleteProduct(999L);

        mockMvc.perform(delete("/api/products/999")
                        .with(csrf()))
                .andExpect(status().isNotFound());

        verify(productService).deleteProduct(999L);
    }

    @Test
    void accessWithoutAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized());
    }
}
