import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const CommonForm = ({ formControls, formData, setFormData, onSubmit, buttonText, isBtnDisabled }) => {
  const [showPassword, setShowPassword] = useState({});

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || '';

    switch (getControlItem.componentType) {

      case "input":
        if (getControlItem.type === 'password') {
          const isVisible = showPassword[getControlItem.name] || false;
          element = (
            <div className="relative">
              <Input
                name={getControlItem.name}
                placeholder={getControlItem.placeholder}
                id={getControlItem.name}
                type={isVisible ? 'text' : 'password'}
                value={value}
                onChange={(event)=> setFormData({...formData,[getControlItem.name]: event.target.value})}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(getControlItem.name)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          );
        } else {
          element = (
            <Input
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              id={getControlItem.name}
              type={getControlItem.type}
              value={value}
              onChange={(event)=> setFormData({...formData,[getControlItem.name]: event.target.value})}
            />
          );
        }
        break;

      case "select":
        element = (
          <Select onValueChange={(value)=>setFormData({...formData,[getControlItem.name]:value})} value={value} >
            <SelectTrigger className='w-full'>
                <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
                {
                    getControlItem.options && getControlItem.options.length > 0 ?
                    getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                        {optionItem.label}
                    </SelectItem>)) : null
                }
            </SelectContent>
          </Select>
        );
        break;

      case "textarea":
        element = (
          <Textarea
          name={getControlItem.name}
          placeholder={getControlItem.placeholder}
          id={getControlItem.id}
          value={value}
          onChange={(event)=> setFormData({...formData,[getControlItem.name]: event.target.value})}
          />
        );
        break;

      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
            value={value}
            onChange={(event)=> setFormData({...formData,[getControlItem.name]: event.target.value})}
          />
        );
        break;
    }
    return element
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5" key={controlItem.name}>
            <Label className="mb-1">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>
      <Button disabled={isBtnDisabled} type='submit' className='mt-2 w-full'>{buttonText || 'Submit'}</Button>
    </form>
  );
};

export default CommonForm;
