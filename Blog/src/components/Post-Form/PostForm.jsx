import React ,{useCallback, useEffect} from 'react'
import { useForm } from 'react-hook-form'
import {Button ,Input, Select,RTE} from '../index'
import appwriteService from '../../appwrite/conf'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


function PostForm({post}) {
   const {register, handlesubmit, watch, setValue,getvalues} = useForm({
    defaultValues:{
      title: post ?.title ||'',
      content: post ?.content || '',
      slug: post ?.slug || '',
      status : post?.status || 'active',
    }
   })
   const navigate = useNavigate()
   const userData = useSelector(state => state.user.userData)

   const submit = async (data) =>{
    if(post) {
      const file = data.image[0] ?  appwriteService.uploadFile(data.image[0]):null
   
    if (file) {
      appwriteService.deleteFile(post.featuredImage)
    }
    const dbpost = await appwriteService.updatePost(post.$id,{
      ...data,
      featuredImage: file ? file.$id : undefined,
    })
    if(dbpost) {
      navigate(`/posts/${dbpost.$id}`)
    }
   } else {
      //TODO: check this for a logic
        const file = await appwriteService.uploadFile(data.image[0]);

        if(file) {
          const fileId = file.$id
          data.featuredImage = fileId
          const dbpost= await appwriteService.createpost({
            ...data,
            userId: userData.$id,
          })
          if(dbpost){
            navigate(`/posts/${dbpost.$id}`)
          }
        }
   }
  }


  const slugTransform = useCallback((value) => {
     if(value && typeof value === 'string') 
         return value
         .trim()
         .toLowerCase()
         .replace(/^[a-zA-Z\d\s]+/g , "-")
         .replace(/\s/g, '-')

         return ''
  },[])

  useEffect(()=>{
    const substribtion = watch ((value ,{name}) => {
      if(name === 'title'){
        setValue('slug', slugTransform(value.title,
          {shouldValidate:true} ))
  }})

      return () =>{
        substribtion.unsubscribe()
      }

  },[watch ,slugTransform,setValue])
    return (
    <form onSubmit={handlesubmit(submit)} className='flex flex-wrap'>
      <div className="w-2/3 px-2">
       <Input
       label="Title:"
       placeholder ="Title"
       className = "mb-4"
       {...register("title",{required:true})}
       />
       <Input
       label = "Slug:"
       placeholder = "Slug"
       className = "mb-4"
       {...register("slug",{shouldValidate:true})}
        onInput ={(e) => {
          setValue("slug", slugTransform(e.currentTager.value),{shouldValidate:true});
        }}
       />
       <RTE
        label="Content:"
        name= "content"
        control={control}
        defaultvalue={getvalues("content")}
       />
      </div>
      <div className="w-1/3 px-2" >
      <Input
      label="Featured Image:"
      type="file"
      className="mb-4"
      accept=" image/png, image/jpg, image/jpeg, image/gif"
      {...register("image", {required: !post})}
      />

     {post && (
      <div className='w-full mb-4'>
        <img src={appwriteService.getFilePreview(post.featuredImage)} alt={post.title} 
        className="rounded-lg"
        />
        </div>
     )}
    <Select
     options = {["active" , "inactive"]}
     label = "Status"
     className = "mb-4"
     {...register("status",{required:true})}

    />

    <Button
     type="submit"
     bgColor ={post ? "bg-green-500" :undefined}
     className = "w-full"> 
      {post ? "Update" : "Submit"}
      </Button>
      </div>
 
    </form>
    )
}

export default PostForm