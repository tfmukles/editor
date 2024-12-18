const CustomizeInput = ({
  isList,
  value,
  label,
  name,
}: {
  isList: boolean;
  label: string;
  value: string;
  name: string;
}) => {
  return (
    <div className={!isList ? "mb-4" : "mb-1"}>
      {!isList && (
        <label className="block font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="mt-1">
        <input
          type="number"
          name={name}
          id={name}
          className="shadow-sm focus:ring-sky-400 focus:border-sky-400 block w-full border-gray-300 rounded-lg dark:bg-dark dark:text-gray-300"
          placeholder={label}
          defaultValue={value}
        />
      </div>
    </div>
  );
};
