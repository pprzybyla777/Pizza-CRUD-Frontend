import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../api/api-slice";

const pizzasAdapter = createEntityAdapter({});

const initialState = pizzasAdapter.getInitialState();

export const pizzasApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPizzas: builder.query({
      query: ({ name, withGluten }) => `/pizzas?name=${name}&gluten=${withGluten}`,
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        // jak będą błedy to tu map id
        const loadedPizzas = responseData;
        console.log("loaded pizzas: ");
        console.log(loadedPizzas);
        return pizzasAdapter.setAll(initialState, loadedPizzas);
      },
      providesTags: (result, error, arg) => {
        console.log(result);
        if (result?.ids) {
          return [
            { type: "Pizza", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Pizza", id })),
          ];
        } else return [{ type: "Pizza", id: "LIST" }];
      },
    }),
    addNewPizza: builder.mutation({
      query: (initialPizzaData) => ({
        url: "/pizzas",
        method: "POST",
        body: {
          ...initialPizzaData,
        },
      }),
      invalidatesTags: [{ type: "Pizza", id: "LIST" }],
    }),
    updatePizza: builder.mutation({
      query: (initialPizzaData) => ({
        url: "/pizzas",
        method: "PATCH",
        body: {
          ...initialPizzaData,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Pizza", id: arg.id }],
    }),
    deletePizza: builder.mutation({
      query: ({ id }) => ({
        url: `/pizzas`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Pizza", id: arg.id }],
    }),
    addPizzaComment: builder.mutation({
        query: ({pizzaId, newComment}) => ({
          url: `/pizzas/comments/${pizzaId}`,
          method: "POST",
          body: {
            ...newComment,
          },
        }),
        invalidatesTags: [{ type: "Pizza", id: "LIST" }],
      }),
    deletePizzaComment: builder.mutation({
        query: ({ pizzaId, commentId }) => ({
          url: `/pizzas/comments/${pizzaId}`,
          method: "DELETE",
          body: { commentId },
        }),
        invalidatesTags: (result, error, arg) => [{ type: "Pizza", id: arg.id }],
      }),
  }),
});

export const {
  useGetPizzasQuery,
  useAddNewPizzaMutation,
  useUpdatePizzaMutation,
  useDeletePizzaMutation,
  useDeletePizzaCommentMutation,
  useAddPizzaCommentMutation,
  useSearchPizzaByNameQuery,
} = pizzasApiSlice;

export const selectPizzasResult = pizzasApiSlice.endpoints.getPizzas.select({name: "", withGluten: true});

const selectPizzasData = createSelector(
  selectPizzasResult,
  (pizzasResult) => pizzasResult.data
);

export const {
  selectAll: selectAllPizzas,
  selectById: selectPizzaById,
  selectIds: selectPizzaIds,
} = pizzasAdapter.getSelectors(
  (state) => selectPizzasData(state) ?? initialState
);
