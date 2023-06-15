import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Categories() {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }
  async function saveCategory(ev) {
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    try {
      if (editedCategory) {
        data._id = editedCategory._id;
        await axios.put("/api/categories/", data);
        setEditedCategory(null);
      } else {
        await axios.post("/api/categories", data);
      }

      setName("");
      setParentCategory("");
      setProperties([]);
      fetchCategories();
    } catch (error) {
      console.log(error.message);
    }
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);

    if (category.parent) {
      setParentCategory(category.parent._id);
      setProperties(
        category.properties.map(({ name, values }) => ({
          name,
          values: values.join(","),
        }))
      );
    } else {
      setParentCategory("");
    }
  }

  function deleteCategory(category) {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${category.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { _id } = category;
        await axios.delete("/api/categories?_id=" + _id);
        fetchCategories();
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  }

  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }
  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create category name"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            className="mb-0"
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <select
            className="mb-0"
            onChange={(ev) => {
              setParentCategory(ev.target.value);
            }}
            value={parentCategory}
          >
            <option value="">No Parent Category</option>
            {categories.length > 0 &&
              categories.map((categories) => (
                <option key={categories._id} value={categories._id}>
                  {categories.name}
                </option>
              ))}
          </select>
        </div>

        <div className="my-2">
          <label className="block">Properties</label>
          <button onClick={addProperty} type="button" className="btn-default">
            Add new property
          </button>
        </div>
        {properties.length > 0 &&
          properties.map((property, index) => (
            <div key={''} className="flex gap-1">
              <input
                type="text"
                value={property.name}
                onChange={(ev) =>
                  handlePropertyNameChange(index, property, ev.target.value)
                }
                placeholder="property name (example: color)"
              />
              <input
                type="text"
                value={property.values}
                onChange={(ev) =>
                  handlePropertyValuesChange(index, property, ev.target.value)
                }
                placeholder="values, comma separated"
              />
              <button
                onClick={() => removeProperty(index)}
                type="button"
                className="bg-red-600 text-white mb-2.5  px-5 py-1 rounded-lg shadow-sm"
              >
                Remove
              </button>
            </div>
          ))}

        <div className="flex gap-2">
          <button type="submit" className="btn-default">
            Save
          </button>
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
              className=" btn-red"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {!editedCategory && (
        <table className="basic my-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent category</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td>
                    <div className="flex space-x-5">
                      <button
                        onClick={() => {
                          editCategory(category);
                        }}
                        className="border-transparent bg-white  px-4 py-1 rounded-sm shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          deleteCategory(category);
                        }}
                        className="border-transparent bg-red-400  px-4 py-1 rounded-sm shadow-sm text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
